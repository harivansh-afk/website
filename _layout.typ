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

#let thought(title: "", description: "", date: none, body) = {
  elem("html", attrs: (lang: "en"))[
    #elem("head")[
      #meta((charset: "utf-8"))
      #meta((name: "viewport", content: "width=device-width, initial-scale=1"))
      #meta((name: "description", content: description))
      #elem("title")[#title]
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
