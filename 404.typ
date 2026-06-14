#import "_layout.typ": elem, meta

#elem("html", attrs: (lang: "en"))[
  #elem("head")[
    #meta((charset: "utf-8"))
    #meta((name: "viewport", content: "width=device-width, initial-scale=1"))
    #elem("title")[404]
    #elem("link", attrs: (rel: "stylesheet", href: "/style.css?v=status-20260604-3"))
    #elem("link", attrs: (rel: "icon", href: "/icon.svg", type: "image/svg+xml"))
    #elem("script", attrs: (src: "/status.js?v=20260604", defer: "defer"))
  ]
  #elem("body")[
    #elem("main", attrs: (class: "not-found"))[
      #elem("nav")[
        #elem("a", attrs: (href: "/", class: "back-link"))[..]
      ]
      #elem("section", attrs: (class: "not-found-content"))[
        #elem("h1")[404]
      ]
    ]
  ]
]
