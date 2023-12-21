<template>
  <IFCViewer />
</template>

<script setup lang="ts">
import IFCViewer from '../../lib'
import * as OBC from "openbim-components"
import { onMounted } from 'vue';
import { useViewersManager } from '../../lib'

const viewersManager = useViewersManager()
const viewer = viewersManager.get()

onMounted(() => {
  const ifcLoader = viewer.tools.get(OBC.FragmentIfcLoader)
  ifcLoader.onIfcLoaded.add(model => {
    console.log(`${model.name} loaded!`)
  })
})
</script>

<style scoped></style>