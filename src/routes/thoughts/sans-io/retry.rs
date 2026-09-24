fn tick(&mut self, now: Duration) -> Option<Action> {
    if now < self.retry_at {
        return None;
    }

    self.retry_at = now + self.retry_interval;
    Some(Action::Send { request_id: self.id })
}
