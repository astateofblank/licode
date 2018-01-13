<template>
  <div id="app">
    <f7-statusbar></f7-statusbar>
    <f7-panel left reveal layout="dark">
      <f7-view id="left-panel-view" navbar-through :dynamic-navbar="true">
        <f7-navbar title="Left Panel"></f7-navbar>
        <f7-pages>
          <f7-page>
            <f7-block inner>
              <p>Left panel content goes here</p>
            </f7-block>
            <f7-block-title>Load page in panel</f7-block-title>
            <f7-list>
              <f7-list-item link="/about/" title="About"></f7-list-item>
              <f7-list-item link="/form/" title="Form"></f7-list-item>
            </f7-list>
            <f7-block-title>Load page in main view</f7-block-title>
            <f7-list>
              <f7-list-item link="/about/" title="About" link-view="#main-view" link-close-panel></f7-list-item>
              <f7-list-item link="/form/" title="Form" link-view="#main-view" link-close-panel></f7-list-item>
            </f7-list>
          </f7-page>
        </f7-pages>
      </f7-view>
    </f7-panel>
    <f7-views>
      <f7-view id="main-view" navbar-through :dynamic-navbar="true" main>
        <!-- Navbar -->
        <f7-navbar>
          <f7-nav-left>
            <f7-link icon="icon-bars" open-panel="left"></f7-link>
          </f7-nav-left>
          <f7-nav-center sliding>Laser Image G-code</f7-nav-center>
        </f7-navbar>
        <f7-pages>
          <f7-page>
            <f7-block-title>Select an image</f7-block-title>
            <f7-block inner>
              <input type="file" accept=".jpg,.jpeg,.bmp,.png" @change="processFile($event)">
            </f7-block>
          </f7-page>
        </f7-pages>
      </f7-view>
    </f7-views>
  </div>
</template>

<script>
  require('jimp/browser/lib/jimp')
  const jimp = window.Jimp

  export default {
    data: () => ({
      image: null
    }),
    methods: {
      processFile(event) {
        const reader = new FileReader()

        reader.addEventListener('load', (event) => {
          jimp.read(event.target.result).then((image) => {
            this.image = image
          })
        })

        reader.readAsArrayBuffer(event.target.files[0])
      }
    }
  }
</script>