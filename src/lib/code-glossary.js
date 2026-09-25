// Hover definitions for std/crate items that code snippets use but do not
// define. Signatures and doc lines are checked against the linked docs; keep
// it that way when adding entries.
//
// `use` decides where a name resolves:
//   type    bare name or last path segment (`Duration`, `std::time::Duration`)
//   variant bare name (`Some`, `None`)
//   assoc   after `::` (`u16::try_from`, `Duration::from_secs`)
//   method  after `.` (`.unwrap_or_default()`)
// Keys with `::` (`Duration::from_secs`) match that exact path first.

const STD = "https://doc.rust-lang.org/std";

export const glossary = {
  Duration: {
    use: "type",
    code: `pub struct Duration {
    secs: u64,
    nanos: Nanoseconds, // a u32 in 0..=999_999_999
}`,
    doc: "A `Duration` type to represent a span of time, typically used for system timeouts. Both fields are private.",
    url: `${STD}/time/struct.Duration.html`,
  },
  "Duration::from_secs": {
    use: "assoc",
    owner: "Duration",
    code: "pub const fn from_secs(secs: u64) -> Duration",
    doc: "Creates a new `Duration` from the specified number of whole seconds.",
    url: `${STD}/time/struct.Duration.html#method.from_secs`,
  },
  Option: {
    use: "type",
    code: `pub enum Option<T> {
    None,
    Some(T),
}`,
    doc: "The `Option` type: either `Some` value of type `T`, or `None`.",
    url: `${STD}/option/enum.Option.html`,
  },
  Some: {
    use: "variant",
    owner: "Option",
    code: "Some(T)",
    doc: "Some value of type `T`.",
    url: `${STD}/option/enum.Option.html#variant.Some`,
  },
  None: {
    use: "variant",
    owner: "Option",
    code: "None",
    doc: "No value.",
    url: `${STD}/option/enum.Option.html#variant.None`,
  },
  u64: {
    use: "type",
    code: "u64",
    doc: "The 64-bit unsigned integer type.",
    url: `${STD}/primitive.u64.html`,
  },
  u16: {
    use: "type",
    code: "u16",
    doc: "The 16-bit unsigned integer type.",
    url: `${STD}/primitive.u16.html`,
  },
  bool: {
    use: "type",
    code: "bool",
    doc: "The boolean type.",
    url: `${STD}/primitive.bool.html`,
  },
  try_from: {
    use: "assoc",
    owner: "TryFrom",
    code: "fn try_from(value: T) -> Result<Self, Self::Error>",
    doc: "Performs the conversion. `TryFrom` is for simple and safe type conversions that may fail in a controlled way.",
    url: `${STD}/convert/trait.TryFrom.html#tymethod.try_from`,
  },
  unwrap_or_default: {
    use: "method",
    owner: "Result",
    code: `pub fn unwrap_or_default(self) -> T
where
    T: Default,`,
    doc: "Returns the contained `Ok` value or a default.",
    url: `${STD}/result/enum.Result.html#method.unwrap_or_default`,
  },
  instrument: {
    use: "method",
    owner: "tracing::Instrument",
    code: "fn instrument(self, span: Span) -> Instrumented<Self>",
    doc: "Instruments this type with the provided `Span`, returning an `Instrumented` wrapper.",
    url: "https://docs.rs/tracing/latest/tracing/trait.Instrument.html#method.instrument",
  },
  await: {
    use: "method",
    code: `pub trait Future {
    type Output;
    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output>;
}`,
    doc: "Suspend execution until the result of a `Future` is ready.",
    url: `${STD}/keyword.await.html`,
  },
};
