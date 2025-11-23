"use client";

import React from "react";

const GoogleReviewsWidget = () => {
  return (
    <div>
       <div className="text-center mb-16">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">
        See What Families Are Saying
      </h2>
      <p className="text-lg text-gray-700 mb-8">
        Read genuine reviews from parents and players on Google
      </p>
    </div>
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
