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
