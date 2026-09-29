# Boss Fight Atlas moved

The project now lives at [polyakovin/boss-fight-atlas](https://github.com/polyakovin/boss-fight-atlas). Visit the [atlas](https://polyakovin.github.io/boss-fight-atlas/) at its new site address.

This repository publishes redirect-only pages for the former `https://polyakovin.github.io/gamedev-boss-fights/` site. The `site/` directory mirrors all 1,145 routes from the atlas sitemap at the time of the move. A custom `404.html` also redirects future legacy routes in browsers. Each page points to the corresponding route on the new site and preserves query strings and fragments when JavaScript is available.

To refresh redirects after new atlas routes are published, regenerate `site/` from the current [sitemap](https://polyakovin.github.io/boss-fight-atlas/sitemap.xml). The Pages workflow deploys only `site/`.
