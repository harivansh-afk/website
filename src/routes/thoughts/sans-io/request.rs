use std::time::Duration;

/// Work the request logic hands to the network worker.
enum Action {
    /// Send the request's bytes, or send them again.
    Send { request_id: u64 },
    /// Hand the reply back to the caller.
    Complete { request_id: u64 },
}

/// One request the logic is tracking.
struct Request {
    id: u64,
    /// Set once a reply has been handled.
    done: bool,
    /// When to send again if no reply has arrived, as time since start.
    retry_at: Duration,
    /// How long to wait between sends.
    retry_interval: Duration,
}

impl Request {
    // #region tick
    /// Called with the current time. Returns a send if the retry deadline passed.
    fn tick(&mut self, now: Duration) -> Option<Action> {
        if self.done || now < self.retry_at {
            return None;
        }

        self.retry_at = now + self.retry_interval;
        Some(Action::Send { request_id: self.id })
    }
    // #endregion

    /// Called when a reply for this request comes off the incoming queue.
    fn on_reply(&mut self) -> Option<Action> {
        self.done = true;
        Some(Action::Complete { request_id: self.id })
    }
}

fn main() {
    let secs = Duration::from_secs;
    let mut request = Request { id: 7, done: false, retry_at: secs(10), retry_interval: secs(10) };

    // The failing order: no reply by the deadline, then both replies arrive.
    let mut completions = 0;
    let events = [request.tick(secs(10)), request.on_reply(), request.on_reply()];
    for action in events.into_iter().flatten() {
        match action {
            Action::Send { .. } => {}
            Action::Complete { request_id } => {
                assert_eq!(request_id, 7);
                completions += 1;
            }
        }
    }
    assert_eq!(completions, 2, "the bug: request 7 completes twice");
}
