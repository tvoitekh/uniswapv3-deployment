import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { aliases, mdi } from "vuetify/iconsets/mdi-svg";
// make sure to also import the coresponding css
import "@mdi/font/css/materialdesignicons.css"; // Ensure you are using css-loader
// Ensure your project is capable of handling css files

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
