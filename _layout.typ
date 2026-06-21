#let elem = html.elem
#let meta(attrs) = elem("meta", attrs: attrs)

#let link(url, body) = elem(
  "a",
  attrs: if str(url).starts-with("/") {
    (href: url)
  } else {
    (href: url, target: "_blank", rel: "noopener noreferrer")
  },
  body,
)

#let code(body) = elem("code", body)
#let item(body) = elem("li", body)

// GitHub-style admonition / callout (note, tip, important, warning, caution)
#let _callout-icons = (
  warning: "M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z",
  note: "M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z",
)

#let callout(kind: "warning", body) = {
  let title = upper(kind.at(0)) + kind.slice(1)
  elem("div", attrs: (class: "callout callout-" + kind))[
    #elem("p", attrs: (class: "callout-title"))[
      #elem(
        "svg",
        attrs: (
          class: "callout-icon",
          viewBox: "0 0 16 16",
          width: "16",
          height: "16",
          fill: "currentColor",
          "aria-hidden": "true",
        ),
      )[#elem("path", attrs: (d: _callout-icons.at(kind, default: _callout-icons.note)))]
      #title
    ]
    #body
  ]
}

#let site-url = "https://harivan.sh"
#let og-image = site-url + "/og.png"

#let og-tags(title: "", description: "", url: site-url) = {
  meta((property: "og:type", content: "website"))
  meta((property: "og:site_name", content: "Harivansh Rathi"))
  meta((property: "og:title", content: title))
  meta((property: "og:description", content: description))
  meta((property: "og:url", content: url))
  meta((property: "og:image", content: og-image))
  meta((property: "og:image:width", content: "1200"))
  meta((property: "og:image:height", content: "630"))
  meta((property: "og:image:alt", content: "Harivansh Rathi - distributed systems and ai computers"))
  meta((name: "twitter:card", content: "summary_large_image"))
  meta((name: "twitter:title", content: title))
  meta((name: "twitter:description", content: description))
  meta((name: "twitter:image", content: og-image))
}

#let thought(title: "", description: "", date: none, body) = {
  elem("html", attrs: (lang: "en"))[
    #elem("head")[
      #meta((charset: "utf-8"))
      #meta((name: "viewport", content: "width=device-width, initial-scale=1"))
      #meta((name: "description", content: description))
      #elem("title")[#title]
      #og-tags(title: title, description: description, url: site-url + "/thoughts/")
      #elem("link", attrs: (rel: "stylesheet", href: "../../style.css?v=code-bg-20260505"))
      #elem("link", attrs: (rel: "icon", href: "/icon.svg", type: "image/svg+xml"))
    ]
    #elem("body")[
      #elem("main", attrs: (class: "thought"))[
        #elem("nav")[
          #elem("a", attrs: (href: "/", class: "back-link"))[..]
        ]
        #elem("article")[
          #elem("header")[
            #elem("h1")[#title]
            #if date != none {
              elem("p", attrs: (class: "meta"))[#date]
            }
          ]
          #body
        ]
      ]
    ]
  ]
}
