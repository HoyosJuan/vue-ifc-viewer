import App from './components/App.vue'
import { createApp } from 'vue'
import { ifcViewer } from '../lib'

// Get material icons
const materialIconsLink = document.createElement("link")
materialIconsLink.rel = "stylesheet"
materialIconsLink.href = "https://fonts.googleapis.com/icon?family=Material+Icons"

// Get openbim-components styles
const fetchResponse = await fetch("https://raw.githubusercontent.com/IFCjs/components/main/resources/styles.css")
const componentsCSS = await fetchResponse.text()
const styleElement = document.createElement("style")
styleElement.id = "openbim-components"
styleElement.textContent = componentsCSS

const firstLinkTag = document.head.querySelector("link")
if (firstLinkTag) {
  document.head.insertBefore(materialIconsLink, firstLinkTag)
  document.head.insertBefore(styleElement, firstLinkTag)
} else {
  document.head.append(materialIconsLink)
  document.head.append(styleElement)
}

createApp(App).use(ifcViewer).mount('#app')