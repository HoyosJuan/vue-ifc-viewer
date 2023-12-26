# Vue IFC Viewer
Vue IFC Viewer is a [VueJS](https://vuejs.org/) plugin written in typescript that let developers integrate [OpenBIM Components](https://github.com/IFCjs/components) in their apps 🚀🚀.<br><br>

## Getting started
These getting started steps assumes you already have some basic VueJS knowledge.<br><br>

1. Install vue-ifc-viewer in your VueJS app with `npm i vue-ifc-viewer`.
2. vue-ifc-viewer has openbim-components set as a peer dependency, so you need to install it with `npm i openbim-components`. _**Note:** keep in mind openbim-components also has peer dependencies, so you need to install them as well. Please, refer to their [docs](https://docs.thatopen.com/components/getting-started#try-them) to know more._
3. Once you've all dependencies installed, add the plugin to your vue app:

   ```ts
   import { createApp } from "vue"
   import { ifcViewer } from "vue-ifc-viewer"
   import App from "./components/App.vue"

   createApp(App).use(ifcViewer).mount("#app")
   ```
4. What the plugin does is to let you use the IFCViewer component anywhere you want and access it using a composable (useViewersManager). So, in the App component that is the entry point of this getting started guide you can have something like the following:

   ```vue
   <template>
     <IFCViewer />
   </template>

   <script setup lang="ts">
   import * as OBC from "openbim-components"
   import { onMounted } from 'vue';
   import IFCViewer from 'vue-ifc-viewer' //This is the VueJS component that will render the IFCViewer in your app.
   import { useViewersManager } from 'vue-ifc-viewer' //This is a VueJS composable that lets you access the viewer instance.

   const viewersManager = useViewersManager()
   const viewer = viewersManager.get()
   
   onMounted(() => {
     const ifcLoader = viewer.tools.get(OBC.FragmentIfcLoader)
     ifcLoader.onIfcLoaded.add(model => {
       console.log(`${model.name} loaded!`)
     })
   })
   </script>
   ```
<br>
You can see this same example [here](https://github.com/HoyosJuan/vue-ifc-viewer/tree/main/src).
<br><br>

## How it works?
Vue-ifc-viewer relies on the provide/inject api from VueJS in order to [provide](https://github.com/HoyosJuan/vue-ifc-viewer/blob/main/lib/index.ts#L15) to the whole app with a [ViewersManager](https://github.com/HoyosJuan/vue-ifc-viewer/blob/main/lib/composables/useViewerManager.ts#L8). The ViewersManager lets you create and access different instances of an OpenBIM Components viewer (yes! you can create more than one viewer at the time). The plugin comes with a default ready to go viewer setup, but you can customize it as you want to suit the needs of your app.<br><br>

### Customizing the viewer
When you use the plugin in your app, you've the chance to pass an optional configuration object to customize the viewer logic. This can be done as the following:

```ts
import * as OBC from "openbim-components"
import { createApp } from "vue"
import { ifcViewer, IfcPluginConfig, ViewerSetup } from "vue-ifc-viewer"
import App from "./components/App.vue"

//You can create this function in other file and import it here
const customViewer: ViewerSetup = async (viewer: OBC.Components, container: HTMLDivElement) => {

  //Initialize the viewer with some basics
  const sceneComponent = new OBC.SimpleScene(viewer)
  sceneComponent.setup()
  viewer.scene = sceneComponent

  const renderer = new OBC.PostproductionRenderer(viewer, container)
  viewer.renderer = renderer
  const camera = new OBC.OrthoPerspectiveCamera(viewer)
  viewer.camera = camera

  const raycaster = new OBC.SimpleRaycaster(viewer)
  viewer.raycaster = raycaster

  await viewer.init()
  camera.updateAspect()
  renderer.postproduction.enabled = true

  //You can start to add tools as you want!
  //Refer to the official documentation at docs.thatopen.com to know more, in the tutorials section you can see many examples.
}

createApp(App).use(ifcViewer).mount("#app")
```

<br>When you use the IFCViewer component, it will use the above configuration to initialize the viewer.<br><br>

### Accessing the viewer
As said before, [useViewersManager](https://github.com/HoyosJuan/vue-ifc-viewer/blob/main/lib/composables/useViewerManager.ts#L29) lets you access you viewers instances from any component in your VueJS app. In order to do it, you can go as the following:

<br>In the component where you include the viewer:
```vue
<template>
  <IFCViewer />
</template>

<script setup lang="ts">
import IFCViewer from 'vue-ifc-viewer'
</script>
```

<br>From any other component in your app:
```vue
<script setup lang="ts">
import { useViewersManager } from 'vue-ifc-viewer'

const viewersManager = useViewersManager()
const viewer = viewersManager.get()
//Do whatever you want with the viewer instance, like using other tools.
</script>
```
<br>

### Creating multiple viewers
You can use the IFCViewer component from vue-ifc-viewer as many times as you want in order to create multiple viewers, the only thing to keep in mind is to give them unique names. You can do that as follows:

<br>In the component where you include the viewers:
```vue
<template>
  <IFCViewer name="viewer-a" />
  <IFCViewer name="viewer-b" />
</template>

<script setup lang="ts">
import IFCViewer from 'vue-ifc-viewer'
</script>
```

<br>If you don't give your viewer any name, [it will be named "default"](https://github.com/HoyosJuan/vue-ifc-viewer/blob/main/lib/components/IFCViewer.vue#L4). Also, all viewers will get initialized with the same settings you set in the plugin configuration.

<br>From any other component in your app:
```vue
<script setup lang="ts">
import { useViewersManager } from 'vue-ifc-viewer'

const viewersManager = useViewersManager()
const viewerA = viewersManager.get("viewer-a")
const viewerB = viewersManager.get("viewer-b")
//Do whatever you want with both viewer instances.
</script>
```

<br>If you don't give your viewer any name (meaning it will be named "default") you can call `viewersManager.get()` [without any argument](https://github.com/HoyosJuan/vue-ifc-viewer/blob/main/lib/composables/useViewerManager.ts#L16).
