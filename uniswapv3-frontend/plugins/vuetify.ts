import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { aliases, mdi } from "vuetify/iconsets/mdi-svg";
import colors from "vuetify/util/colors";

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    directives,
    icons: {
      defaultSet: "mdi",
      aliases,
      sets: {
        mdi,
      },
    },
    theme: {
      themes: {
        light: {
          colors: {
            primary: "#FF72FE",
            secondary: "#ffefff",
          },
        },
        dark: {
          colors: {
            primary: "#fd72fe",
            secondary: "#ffefff",
          },
        },
      },
    },
  });

  nuxtApp.vueApp.use(vuetify);
});
