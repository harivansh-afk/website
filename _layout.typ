#let elem = html.elem
#let meta(attrs) = elem("meta", attrs: attrs)

#let link(url, body, preview: none, preview-label: none) = {
  let attrs = if str(url).starts-with("/") {
    (href: url)
  } else {
    (href: url, target: "_blank", rel: "noopener noreferrer")
  }
  if preview != none { attrs.insert("data-preview", preview) }
  if preview-label != none { attrs.insert("data-preview-label", preview-label) }
  elem("a", attrs: attrs, body)
}

#let code(body) = elem("code", body)
#let item(body) = elem("li", body)

// A quiet aside: small uppercase label + body, set off by a left rule.
#let callout(kind: "aside", body) = {
  elem("div", attrs: (class: "callout"))[
    #elem("div", attrs: (class: "callout-label"))[
      #elem("span")[#kind]
    ]
    #body
  ]
}

// file tree: plain indented rows, styled to match code blocks;
// dirs end in "/", notes render as trailing muted comments
#let ftrow(depth, name, note: none) = elem(
  "div",
  attrs: (class: "ft-row", style: "padding-left: " + str(depth * 1.25) + "rem"),
)[
  #elem("span", attrs: (class: "ft-name"))[#name]
  #if note != none { elem("span", attrs: (class: "ft-note"))[#note] }
]
#let filetree(body) = elem("div", attrs: (class: "filetree"))[#body]

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
      #elem("link", attrs: (rel: "stylesheet", href: "../../style.css?v=link-previews-20260813d"))
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
