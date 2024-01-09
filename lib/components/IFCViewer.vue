<template>
  <div
    ref="container" 
    :id="`ifc-viewer-${props.name?? 'default'}`" 
    style="
      overflow: hidden;
      min-width: 0; 
      min-height: 0; 
      width: 100%; 
      height: 100%;
    ">
  </div>
</template>

<script setup lang="ts">

import * as OBC from "openbim-components"
import * as Vue from "vue"
import { useViewersManager } from "../composables"

interface Props {
  name?: string
  setup?: (viewer: OBC.Components, container: HTMLDivElement, name: string) => Promise<void>
  extraSetup?: (viewer: OBC.Components) => Promise<void>
}

const viewersManager = useViewersManager()
const props = withDefaults(defineProps<Props>(), {
  name: "default",
  extraSetup: async () => {}
})

const container = Vue.ref<HTMLDivElement>()

const viewer = viewersManager.get(props.name)

Vue.onMounted(async () => {
  const viewerContainer = container.value as HTMLDivElement
  const setup = props.setup ?? viewersManager.defaultViewerSetup
  await setup(viewer, viewerContainer, props.name)
  await props.extraSetup(viewer)
})

Vue.onBeforeUnmount(() => viewersManager.destroy(props.name))

</script>