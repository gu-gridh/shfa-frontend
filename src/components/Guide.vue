<template>
  <div class="guide-container" :class="{ fullopacity: visibleGuide }" id='block-text'>
    <div class="content">


      <div class="rows">


        <div class="flex-machine">
          <div class="logo-area">
            <div id="logo-guide"></div>
            <h1 class="title">
              <div v-html="$t('message.abouttitle')"></div>
            </h1>
          </div>

          <div class="guide-article-main" :class="{ fullopacityui: visibleGuide }" style="margin-bottom: 0px;">
            <h2>{{ $t('message.sökguide') }}</h2>
          </div>

          <div class="guide-article-main" :class="{ fullopacityui: visibleGuide }" style="padding-top:0px;">{{
    $t('search.searchintro') }} {{ $t('search.searchhelp') }}</div>

          <div class="guide-article-sub" :class="{ fullopacityui: visibleGuide }">
            <div class="sections"> <!-- Empty div for margin -->
              <h2>{{ $t('message.nyckelord') }}</h2>
              <div class="first">
                <section>
                  <h3>{{ $t('search.documentation') }}</h3>
                  <ul>
                    <li
                      v-for="(value, key) in Object.fromEntries(Object.entries(this.$i18n.messages.en.keywords).slice(0, 6))"
                      :key="key">
                      {{ $t('keywords.' + key) }}
                    </li>
                  </ul>
                </section>
                <section>
                  <h3>{{ $t('search.environment') }}</h3>
                  <ul>
                    <li
                      v-for="(value, key) in Object.fromEntries(Object.entries(this.$i18n.messages.en.keywords).slice(6, 10))"
                      :key="key">
                      {{ $t('keywords.' + key) }}
                    </li>
                  </ul>
                </section>
                <section>
                  <h3>{{ $t('search.description') }}</h3>
                  <ul>
                    <li
                      v-for="(value, key) in Object.fromEntries(Object.entries(this.$i18n.messages.en.keywords).slice(10, 19))"
                      :key="key">
                      {{ $t('keywords.' + key) }}
                    </li>
                  </ul>
                </section>
                <section>
                  <h3>{{ $t('search.type') }}</h3>
                  <ul>
                    <li
                      v-for="(value, key) in Object.fromEntries(Object.entries(this.$i18n.messages.en.keywords).slice(19, 25))"
                      :key="key">
                      {{ $t('keywords.' + key) }}
                    </li>
                  </ul>
                </section>
                <section>
                  <h3 scope="rowgroup">{{ $t('search.natural') }}</h3>
                  <ul>
                    <li
                      v-for="(value, key) in Object.fromEntries(Object.entries(this.$i18n.messages.en.keywords).slice(25, 29))"
                      :key="key">
                      {{ $t('keywords.' + key) }}
                    </li>
                  </ul>
                </section>
                <section>
                  <h3>{{ $t('search.humans') }}</h3>
                  <ul>
                    <li
                      v-for="(value, key) in Object.fromEntries(Object.entries(this.$i18n.messages.en.keywords).slice(29, 49))"
                      :key="key">
                      {{ $t('keywords.' + key) }}
                    </li>
                  </ul>
                </section>
                <section>
                  <h3>{{ $t('search.animals') }}</h3>
                  <ul>
                    <li
                      v-for="(value, key) in Object.fromEntries(Object.entries(this.$i18n.messages.en.keywords).slice(49, 63))"
                      :key="key">
                      {{ $t('keywords.' + key) }}
                    </li>
                  </ul>
                </section>
                <section>
                  <h3>{{ $t('search.ships') }}</h3>
                  <ul>
                    <li
                      v-for="(value, key) in Object.fromEntries(Object.entries(this.$i18n.messages.en.keywords).slice(63, 73))"
                      :key="key">
                      {{ $t('keywords.' + key.replaceAll('.', '_')) }}
                    </li>
                  </ul>
                </section>
                <section>
                  <h3>{{ $t('search.weapons') }}</h3>
                  <ul>
                    <li
                      v-for="(value, key) in Object.fromEntries(Object.entries(this.$i18n.messages.en.keywords).slice(73, 82))"
                      :key="key">
                      {{ $t('keywords.' + key) }}
                    </li>
                  </ul>
                </section>
                <section>
                  <h3>{{ $t('search.other') }}</h3>
                  <ul>
                    <li
                      v-for="(value, key) in Object.fromEntries(Object.entries(this.$i18n.messages.en.keywords).slice(82, 117))"
                      :key="key">
                      {{ $t('keywords.' + key) }}
                    </li>
                  </ul>
                </section>
              </div>
              <div class="second">
                <h2>{{ $t('message.bildtyp') }}</h2>
                <table>
                  <tr>
                    <th scope="col">{{ $t('message.bildtyp') }}</th>
                    <th scope="col">{{ $t('message.beskrivning') }}</th>
                  </tr>
                  <tr v-if="$i18n.locale === 'en'" v-for="(value, key) in this.$i18n.messages.en.imgdescription"
                    :key="key">
                    <td>{{ value[0] }}</td>
                    <td>{{ value[1] }}</td>
                  </tr>
                  <tr v-else v-for="(value, key_sv) in this.$i18n.messages.sv.imgdescription" :key="key_sv">
                    <td>{{ value[0] }}</td>
                    <td>{{ value[1] }}</td>
                  </tr>
                </table>
              </div>
              <div class="third">
                <h2>{{ $t('message.datering') }}</h2>
                <section>
                  <ul>
                    <li
                      v-for="(value, key) in Object.fromEntries(Object.entries(this.$i18n.messages.en.keywords).slice(137))"
                      :key="key">
                      {{ $t('keywords.' + key) }}
                    </li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <button class="close-page-button" @click="$emit('close')">
      <div class="category-button" :class="{ fullopacityui: visibleGuide }"
        style="width:auto; padding:5px 15px; text-align: center; cursor: pointer;">{{ $t('message.close') }}</div>
    </button>
  </div>
</template>

<script lang="ts">
import Grid from '../Views/Grid.vue';
export default {
  name: "guideview",
  emits: ['close'],
  props: {
    visibleGuide: {
      type: Boolean,
      required: true,
    },
  },

};


</script>

<style scoped>
th {
  padding-top: 10px;
  font-weight: 450;
}

td {
  padding-left: 15px;
  padding-right: 5px;
}

a {
  color: var(--ui-hover);
  font-weight: 400;
}

h2 {
  font-size: 125%;
  font-style: bold;
  margin-top: -10px;
  margin-bottom: 5px;
  color: var(--highlighted-text);
  font-weight: 500;
  line-height: 1.5;
}

h3 {
  font-size: 105%;
  font-style: bold;
  margin-top: 15px;
  margin-bottom: 0px;
  color: var(--page-text);
  font-weight: 500;
  line-height: 1.2;
}

ul {
  padding-left: 20px;
}

.guide-article-sub h2 {
  font-size: 115%;
}

.guide-container {
  position: fixed;
  color: var(--page-text);
  line-height: 1;
  width: 100%;
  font-size: 12px;
  z-index: 4000;
  backdrop-filter: blur(5px);
  pointer-events: none;
  transform: scale(1.5);
  translate: 0px 100px;
  transition: all 0.5s ease-in-out;
  opacity: 0.0;
  overflow-y: scroll;
  max-height: max-content;
  background: var(--guide-page-background);
}

.logo-area {
  margin-top: 30px;
  margin-bottom: 20px;
}

#logo-guide {
  position: relative;
  width: 210px;
  height: 200px;
  background-color: var(--page-text);
  float: left;
  margin-left: 80px;
  background: var(--shfa-logo);
  background-repeat: no-repeat;
  background-size: contain;
  opacity: 0.7;
  transition: all 0.8s ease-in-out;
}

.title {
  float: left;
  position: relative;
  pointer-events: none;
  font-family: 'Teko', sans-serif;
  line-height: 0.75;
  letter-spacing: -1.2px;
  margin-top: 10px;
  font-size: 65px;
  font-weight: 400;
  margin-left: 0px;
  padding-left: 30px;
  color: var(--page-text)
}

.flex-machine {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sections {
  float: left;
}

.first {
  width: 100%;
  columns: 5;
  column-gap: 50px;
  margin-bottom: 30px;
}

.second {
  width: 100%;
  margin-bottom: 30px;
}

.third {
  width: 100%;
  margin-bottom: 30px;
}

.rows {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: auto;
}

.guide-main-title {
  font-family: 'Teko', sans-serif;
  margin-top: 10px;
  flex-basis: auto;
  width: 100%;
  font-size: 4em;
  line-height: 0.85;
  font-weight: 100;
  letter-spacing: -0.2px;
  text-align: center;
  color: var(--page-text);
  margin-bottom: 15px;
  transition: all 0.4s ease-in-out;
}

.guide-sub-title {
  font-family: 'Teko', sans-serif;
  margin-top: 2px;
  flex-basis: auto;
  width: 100%;
  font-size: 2.5em;
  line-height: 0.9;
  font-weight: 100;
  letter-spacing: -0.2rem;
  text-align: center;
  color: var(--page-text);
  opacity: 0.0;
  margin-bottom: 20px;
  transition: all 0.4s ease-in-out;
}

.guide-article-main {
  position: relative;
  float: left;
  text-align: justify;
  color: var(--page-text);
  width: 100%;
  columns: 1;
  column-gap: 30px;
  max-width: 1800px;
  font-size: 1.8em;
  font-weight: 300;
  line-height: 1.4;
  opacity: 0.0;
  padding: 0px 100px;
  transition: all 0.4s ease-in-out;
  margin-bottom: 30px;
}

.guide-article-sub {
  position: relative;
  float: left;
  text-align: justify;
  color: var(--page-text);
  width: 100%;
  padding: 30px 100px;
  columns: 1;
  column-gap: 20px;
  font-size: 1.6em;
  font-weight: 300;
  opacity: 0.0;
  transition: all 0.4s ease-in-out;
  line-height: 1.4;
}

.category-button {
  float: left;
  font-size: 1.8em;
  font-weight: 400;
  transition: all 0.4s ease-in-out;
  background-color: var(--button-background);
  padding: 8px 20px !important;
  z-index: 1000;
  opacity: 1.0;
  margin-top: 0px;
  margin-bottom: 0px;
  border-radius: 5px;
  box-shadow: var(--shadow);
}

.close-page-button {
  pointer-events: auto;
  position: sticky;
  z-index: 5000;
  bottom: 0px;
  top: calc(100vh - 80px);
  padding-bottom: 20px;
  color: var(--button-text);
  background: var(--footer-background);
  width: 100%;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.category-button:hover {
  background: var(--button-hover);
}

@media screen and (max-width: 1025px) {
  .columns {
    width: 100%;
  }

  .guide-article-sub {
    font-size: 1.25em;
    -webkit-hyphens: auto;
    -ms-hyphens: auto;
    hyphens: auto;
  }
}

@media (max-width:480px) {
  .content {
    width: 100%;
  }

  .logo-area {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 80px;
  }

  .guide-container .fullopacity {
    margin-top: 0px;
    margin-bottom: 0px;
  }

  #logo-guide {
    margin-left: 0px;
    margin-top: 0px;
  }

  .second tr {
    display: flex;
    justify-content: space-between;
    gap: 10%;
  }

  .second td {
    flex: 1;
    line-height: 1.4;
    padding: 5px;
    box-sizing: border-box;
  }

  .second table {
    border-collapse: separate;
    border-spacing: 0 15px;
  }

  .guide-article-main,
  .guide-article-sub,
  .first,
  .second {
    width: 100%;
    columns: 1;
  }

  .sections {
    float: none;
  }

  table {
    width: 100%;
    overflow-x: auto;
    display: block;
  }

  .guide-search {
    margin-top: 10px;
    font-size: 1em;
    overflow-x: hidden;
    word-wrap: break-word;
  }

  .logo-area {
    margin-top: 20px;
  }

  #logo-guide {
    width: 120px;
    height: 100px;
    margin-left: 10px;
  }

  .title {
    margin-top: 0px;
    font-size: 35px;
    padding-left: 10px;
  }

  .guide-article-main {
    width: 100%;
    columns: 1;
    column-gap: 0px;
    opacity: 0.0;
    padding: 10px 30px;
    transition: all 0.4s ease-in-out;
    font-size: 115%;
    margin-top: -10px;
    margin-bottom: 5px;
    line-height: 1.3;

  }

  .guide-article-sub {
    text-align: justify;
    columns: 1;
    width: 100%;
    padding: 30px;
    font-size: 1.2em;
    font-weight: 300;
    transition: all 0.4s ease-in-out;
    line-height: 1.2;
  }
}

a {
  font-weight: normal;
}

.fullopacity {
  /* backdrop-filter:blur(5px); */
  opacity: 1.0;
  pointer-events: auto;
  transform: scale(1.0);
  translate: 0px 0px;
  background: var(--guide-page-background);
  height: 100vh;
}

.fullopacityui {
  opacity: 1.0;
}
</style>