use std::time::Duration;

/// Work returned to the caller. Constructing an action does no I/O.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum Action {
    /// Send the same logical request again, retaining its request ID.
    Send { request_id: u64 },
    /// Report this request's completion to the application.
    Complete { request_id: u64 },
}

/// A request whose first attempt has already been sent.
#[derive(Clone, Debug, PartialEq, Eq)]
struct Request {
    id: u64,
    /// True after the first reply. Later replies must not complete it again.
    done: bool,
    /// Next retry deadline, measured from the test or process's time origin.
    retry_at: Duration,
    /// Delay between an emitted retry and the following retry deadline.
    retry_interval: Duration,
}

// #region handlers
impl Request {
    fn tick(&mut self, now: Duration) -> Option<Action> {
        if self.done || now < self.retry_at {
            return None;
        }

        self.retry_at = now + self.retry_interval;
        Some(Action::Send {
            request_id: self.id,
        })
    }

    fn on_reply(&mut self) -> Option<Action> {
        if self.done {
            return None;
        }

        self.done = true;
        Some(Action::Complete {
            request_id: self.id,
        })
    }
}
// #endregion

/// Request 7 was sent at time zero; its first retry is due at ten seconds.
fn pending_request() -> Request {
    Request {
        id: 7,
        done: false,
        retry_at: Duration::from_secs(10),
        retry_interval: Duration::from_secs(10),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // #region orderings
    #[test]
    fn reply_before_timeout() {
        let mut request = pending_request();

        assert_eq!(request.on_reply(), Some(Action::Complete { request_id: 7 }));
        assert_eq!(request.tick(Duration::from_secs(10)), None);
    }

    #[test]
    fn timeout_before_reply() {
        let mut request = pending_request();

        assert_eq!(
            request.tick(Duration::from_secs(10)),
            Some(Action::Send { request_id: 7 })
        );
        assert_eq!(request.on_reply(), Some(Action::Complete { request_id: 7 }));
    }
    // #endregion

    // #region duplicate
    #[test]
    fn duplicate_reply_does_not_complete_twice() {
        let mut request = pending_request();

        request.tick(Duration::from_secs(10));
        request.on_reply();
        assert_eq!(request.on_reply(), None);
    }
    // #endregion

    #[test]
    fn retry_waits_for_deadline_and_reschedules_from_now() {
        let mut request = pending_request();
        assert_eq!(request.tick(Duration::from_secs(9)), None);
        assert_eq!(request.retry_at, Duration::from_secs(10));
        assert_eq!(
            request.tick(Duration::from_secs(12)),
            Some(Action::Send { request_id: 7 })
        );
        assert_eq!(request.retry_at, Duration::from_secs(22));
        assert_eq!(request.tick(Duration::from_secs(21)), None);
        assert_eq!(
            request.tick(Duration::from_secs(22)),
            Some(Action::Send { request_id: 7 })
        );
    }

    #[derive(Clone, Copy, Debug)]
    enum Event {
        Tick(Duration),
        Reply,
    }

    fn apply(request: &mut Request, event: Event) -> Option<Action> {
        match event {
            Event::Tick(now) => request.tick(now),
            Event::Reply => request.on_reply(),
        }
    }

    #[test]
    fn replay_reproduces_each_state_and_action() {
        let history = [
            Event::Tick(Duration::from_secs(9)),
            Event::Tick(Duration::from_secs(10)),
            Event::Reply,
            Event::Reply,
            Event::Tick(Duration::from_secs(20)),
        ];
        let mut first = pending_request();
        let mut replay = first.clone();
        for event in history {
            assert_eq!(apply(&mut first, event), apply(&mut replay, event));
            assert_eq!(first, replay);
        }
    }

    #[test]
    fn generated_histories_complete_at_most_once() {
        // A bounded search, not a proof over arbitrary histories. Clock inputs
        // never go backwards. Replies can repeat or remain absent throughout.
        fn explore(
            request: Request,
            now: Duration,
            completions: usize,
            history: &mut Vec<Event>,
            remaining: usize,
        ) {
            if remaining == 0 {
                return;
            }

            let later = now + Duration::from_secs(1);
            let deadline = now.max(request.retry_at);
            for event in [
                Event::Reply,
                Event::Tick(now),
                Event::Tick(later),
                Event::Tick(deadline),
            ] {
                let mut next = request.clone();
                let action = apply(&mut next, event);
                let count =
                    completions + usize::from(matches!(action, Some(Action::Complete { .. })));
                history.push(event);
                assert!(count <= 1, "completed twice: {history:?}");
                if request.done {
                    assert_eq!(action, None, "action after completion: {history:?}");
                }
                let next_time = match event {
                    Event::Tick(time) => time,
                    Event::Reply => now,
                };
                explore(next, next_time, count, history, remaining - 1);
                history.pop();
            }
        }

        explore(pending_request(), Duration::ZERO, 0, &mut Vec::new(), 6);
    }
}
