#import "_layout.typ": elem, meta, link, item, og-tags, site-url

#let thought-link(slug, title) = elem("a", attrs: (href: "/thoughts/" + slug + "/"), title)
#let section(title, body) = elem("section")[
  #elem("h2", title)
  #body
]

#elem("html", attrs: (lang: "en"))[
  #elem("head")[
    #meta((charset: "utf-8"))
    #meta((name: "viewport", content: "width=device-width, initial-scale=1"))
    #meta((name: "description", content: "Compute, AI and Distributed Systems"))
    #elem("title")[Hari]
    #og-tags(title: "Harivansh Rathi", description: "Compute, AI and Distributed Systems", url: site-url)
    #elem("link", attrs: (rel: "stylesheet", href: "./style.css"))
    #elem("link", attrs: (rel: "icon", href: "/icon.svg", type: "image/svg+xml"))
  ]

  #elem("body")[
    #elem("main")[
      #elem("h1")[Harivansh Rathi]

      #elem("p")[Ive been breaking things since i was 5. The first thing i dismantled was my sisters piano when i was 6. When i was 8 my mom bought me a #link("https://www.worldcubeassociation.org/persons/2015RATH01", [rubik's cube]) to stop me from taking apart more of her stuff.]

      #elem("p")[I joined a #link("https://www.facebook.com/roboclubonline/posts/roboclub-team-supercalifragilisticexpialidocious-at-the-first-lego-league-nation/1565656036804624/", [robotics club]) when i was 8 and went on to rep india at the world championship in australia in 2019.]

      #elem("p")[I'm now a 3rd year at #link("https://www.virginia.edu/", [UVA]) studying CS. I enjoy hacking on startups and im currently building hypervisors to redefine computing #link("https://ix.dev", [\@indexable])]

      #section([experiences])[
        #elem("ul")[
          #item([founding engineer, #link("https://github.com/indexable-inc/", [indexable])])
          #item([software engineer, #link("https://companion.ai", [companion])])
          #item([software engineer, #link("https://www.linkedin.com/company/phia-co/", [phia])])
          #item([co-founder, #link("https://www.linkedin.com/company/atlasagentspage/", [atlas agents])])
          #item([web developer, #link("https://unikove.com/", [unikove])])
          #item([backend engineer, #link("https://www.moglix.com/", [moglix])])
        ]
      ]

      #section([projects])[
        #elem("ul")[
          #item([#link("https://git.harivan.sh/harivansh-afk/pierrejo", [pierrejo])])
          #item([#link("https://agentcomputer.ai", [agentcomputer])])
          #item([#link("https://betternas.com", [betterNAS])])
          #item([#link("https://deskctl.dev", [deskctl])])
          #item([#link("https://mixbridge.app/", [mixbridge])])
        ]
      ]

      #section([thoughts])[
        #elem("ul")[
          #item([June 2026, #thought-link("the-self-cleaning-codebase", [the self-cleaning codebase])])
          #item([April 2026, #thought-link("throw-out-your-macbook", [throw out your macbook])])
          #item([March 2026, #thought-link("reflections-on-the-agent-environment", [reflections on the agent environment])])
          #item([February 2026, #thought-link("isolated-long-running-agents-with-kubernetes", [the agent environment])])
          #item([January 2026, #thought-link("the-asymmetry-of-verification", [the asymmetry of verification])])
          #item([December 2025, #thought-link("the-growth-team-is-dead", [the growth team])])
          #item([May 2025, #thought-link("my-core-principles", [core principles])])
        ]
      ]

      #section([contact])[
        #elem("ul")[
          #item([#link("https://linkedin.com/in/harivansh-rathi", [linkedin])])
          #item([#link("https://x.com/HarivanshRathi", [x.com])])
          #item([#link("https://github.com/harivansh-afk", [github]), #link("https://git.harivan.sh/harivansh-afk/", [forgejo])])
        ]
      ]
    ]
  ]
]
