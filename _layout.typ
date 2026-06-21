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

// A quiet aside: small uppercase label + body, set off by a left rule.
// Geometric warning mark: miter-cornered triangle, straight stem, square dot.
#let _callout-icon = elem(
  "svg",
  attrs: (
    class: "callout-icon",
    viewBox: "0 0 16 16",
    width: "13",
    height: "13",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "1.4",
    "stroke-linejoin": "miter",
    "stroke-linecap": "square",
    "aria-hidden": "true",
  ),
)[
  #elem("polygon", attrs: (points: "8,1.5 15,14.5 1,14.5"))
  #elem("line", attrs: (x1: "8", y1: "6", x2: "8", y2: "10"))
  #elem("rect", attrs: (x: "7.25", y: "11.6", width: "1.5", height: "1.5", fill: "currentColor", stroke: "none"))
]

#let callout(kind: "warning", body) = {
  elem("div", attrs: (class: "callout callout-" + kind))[
    #elem("div", attrs: (class: "callout-label"))[
      #_callout-icon
      #elem("span")[#kind]
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
      #elem("link", attrs: (rel: "stylesheet", href: "../../style.css?v=callout-yellow-20260621"))
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
