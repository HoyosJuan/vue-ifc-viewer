import * as OBC from "openbim-components"
import * as THREE from "three"
import { FragmentsGroup } from "bim-fragment"
import { ViewerSetup } from "../index"

export const defaultViewerSetup: ViewerSetup = async (viewer: OBC.Components, container: HTMLDivElement, name: string) => {
  viewer.onInitialized.add(() => console.warn(`'${name}' viewer succesfully initialized!`, viewer) )

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

  const mainToolbar = new OBC.Toolbar(viewer)
  viewer.ui.addToolbar(mainToolbar)

  const grid = new OBC.SimpleGrid(viewer, new THREE.Color(0x414141))
  renderer.postproduction.customEffects.excludedMeshes.push(grid.get())

  const cubeMap = new OBC.CubeMap(viewer)
  cubeMap.setPosition("bottom-right")

  const fragmentManager = new OBC.FragmentManager(viewer)

  const highlighter = new OBC.FragmentHighlighter(viewer)
  await highlighter.setup()

  const culler = new OBC.ScreenCuller(viewer)
  camera.controls.addEventListener("sleep", () => culler.needsUpdate = true)

  const propsProcessor = new OBC.IfcPropertiesProcessor(viewer)

  const propsFinder = new OBC.IfcPropertiesFinder(viewer)
  propsFinder.init()

  propsFinder.onFound.add(result => {
    highlighter.highlightByID("select", result)
  })

  const fragmentBB = new OBC.FragmentBoundingBox(viewer)

  const ifcLoader = new OBC.FragmentIfcLoader(viewer)
  ifcLoader.settings.wasm = {
    path: "https://unpkg.com/web-ifc@0.0.46/",
    absolute: true
  }

  let lowestModelCoordinate = 0
  ifcLoader.onIfcLoaded.add(model => {
    highlighter.update()
    for (const fragment of model.items) { culler.add(fragment.mesh) }
    culler.needsUpdate = true
    fragmentBB.reset()
    fragmentBB.add(model)
    const { min: minBB } = fragmentBB.get()
    if (minBB.y < lowestModelCoordinate) { lowestModelCoordinate = minBB.y }
    grid.get().position.y = lowestModelCoordinate
    propsProcessor.process(model)
    setTimeout(() => camera.fit(), 1)
  })

  const propsManager = new OBC.IfcPropertiesManager(viewer)
  propsProcessor.propertiesManager = propsManager

  const highlighterEvents = highlighter.events
  highlighterEvents.select.onClear.add(() => propsProcessor.cleanPropertiesList())

  highlighterEvents.select.onHighlight.add(selection => {
    const fragmentIDs = Object.keys(selection)
    if (fragmentIDs.length !== 1) {
      propsProcessor.cleanPropertiesList()
      return
    }

    const fragmentID = fragmentIDs[0]
    const expressIDs = [...selection[fragmentID]]
    if (expressIDs.length !== 1) {
      propsProcessor.cleanPropertiesList()
      return
    }

    const expressID = Number(expressIDs[0])
    let model: FragmentsGroup | null = null
    for (const group of fragmentManager.groups) {
      const fragmentFound = Object.values(group.keyFragments).find(id => id === fragmentID)
      if (fragmentFound) model = group
    }
    
    if (model) {
      propsProcessor.renderProperties(model, expressID)
    }
  })

  mainToolbar.addChild(
    ifcLoader.uiElement.get("main"),
    camera.uiElement.get("main"),
    propsProcessor.uiElement.get("main"),
    propsFinder.uiElement.get("main")
  )
}