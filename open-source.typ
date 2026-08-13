#import "_layout.typ": elem, meta, link, og-tags, site-url

#let data = json("data/activity.json")
#let max-commits = calc.max(1, ..data.public.map(r => r.commits))
#let bar(n) = "█" * calc.max(1, int(calc.round(n / max-commits * 22)))
#let total = data.public.map(r => r.commits).sum(default: 0)
#let commits(n) = if n == 1 { "1 commit" } else { str(n) + " commits" }
#let repos(n) = if n == 1 { "1 repo" } else { str(n) + " repos" }

#elem("html", attrs: (lang: "en"))[
  #elem("head")[
    #meta((charset: "utf-8"))
    #meta((name: "viewport", content: "width=device-width, initial-scale=1"))
    #meta((name: "description", content: "Most worked on repos this week"))
    #elem("title")[open source]
    #og-tags(title: "open source", description: "Most worked on repos this week", url: site-url + "/open-source/")
    #elem("link", attrs: (rel: "stylesheet", href: "/style.css?v=open-source-20260813"))
    #elem("link", attrs: (rel: "icon", href: "/icon.svg", type: "image/svg+xml"))
  ]

  #elem("body")[
    #elem("main")[
      #elem("nav")[
        #elem("a", attrs: (href: "/", class: "back-link"))[..]
      ]

      #elem("h1")[open source]
      #if data.week != "" {
        elem("p", attrs: (class: "meta"))[week of #data.week]
      }
      #elem("p")[most worked on repos over the last seven days, from #link("https://github.com/harivansh-afk", [github]) and #link("https://git.harivan.sh/harivansh-afk", [git.harivan.sh]). refreshed daily.]

      #if data.public.len() == 0 {
        elem("p")[a quiet week: no public commits.]
      } else {
        elem("div", attrs: (class: "filetree activity"))[
          #for r in data.public {
            elem("a", attrs: (href: r.url, target: "_blank", rel: "noopener noreferrer", class: "ft-name"))[#r.name]
            elem("span")[#elem("span", attrs: (class: "act-bar"))[#bar(r.commits)] #str(r.commits)]
            elem("span", attrs: (class: "ft-note"))[#r.sources.join(" + ")]
          }
        ]
        elem("p")[#commits(total) across #repos(data.public.len()).]
      }

      #if data.closed.commits > 0 {
        elem("section")[
          #elem("h2")[closed source]
          #elem("p")[#commits(data.closed.commits) across #data.closed.repos private #if data.closed.repos == 1 [repo] else [repos]. names stay private.]
        ]
      }
    ]
  ]
]
