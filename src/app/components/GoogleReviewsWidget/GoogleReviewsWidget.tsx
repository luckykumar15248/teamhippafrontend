"use client";

import React from "react";

const GoogleReviewsWidget = () => {
  return (
    <div>
       <h2 className="text-4xl sm:text-5xl font-semibold text-left md:text-center text-black mb-8">Google Reviews</h2>
      <div
        dangerouslySetInnerHTML={{
          __html: `
            <div class="embedsocial-widget" data-ref="1c1b7f2c374a3a7e8144775a7c2b2273">
              <a href="https://embedsocial.com/google-reviews-widget/" title="Add Google reviews on a website" target="_blank" class="powered-by-es es-slider">
                <img src="https://embedsocial.com/cdn/icon/embedsocial-logo.webp" alt="EmbedSocial" />
                <span> Google reviews widget </span>
              </a>
            </div>
            <script>
              (function(d, s, id) {
                var js;
                if (d.getElementById(id)) {return;}
                js = d.createElement(s);
                js.id = id;
                js.src = "https://embedsocial.com/cdn/aht.js";
                d.getElementsByTagName("head")[0].appendChild(js);
              }(document, "script", "EmbedSocialWidgetScript"));
            </script>
          `,
        }}
      />
    </div>
  );
};

export default GoogleReviewsWidget;
