import * as OBC from "openbim-components"
import * as THREE from "three"
import { FragmentsGroup } from "bim-fragment"
import { ViewerSetup } from "../index"

export const defaultViewerSetup: ViewerSetup = async (viewer: OBC.Components, container: HTMLDivElement) => {
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

  const cubeMap = viewer.tools.get(OBC.CubeMap)
  cubeMap.setPosition("bottom-right")

  const fragmentManager = viewer.tools.get(OBC.FragmentManager)

  const highlighter = viewer.tools.get(OBC.FragmentHighlighter)
  await highlighter.setup()

  const culler = viewer.tools.get(OBC.ScreenCuller)
  await culler.setup()
  camera.controls.addEventListener("rest", () => culler.needsUpdate = true)

  const propsProcessor = viewer.tools.get(OBC.IfcPropertiesProcessor)

  const propsFinder = new OBC.IfcPropertiesFinder(viewer)
  propsFinder.init()

  propsFinder.onFound.add(result => {
    highlighter.highlightByID("select", result)
  })

  const fragmentBB = viewer.tools.get(OBC.FragmentBoundingBox)

  const ifcLoader = viewer.tools.get(OBC.FragmentIfcLoader)
  await ifcLoader.setup()

  let lowestModelCoordinate = 0
  ifcLoader.onIfcLoaded.add(model => {
    highlighter.update()
    for (const fragment of model.items) { culler.add(fragment.mesh) }
    fragmentBB.reset()
    fragmentBB.add(model)
    const { min: minBB } = fragmentBB.get()
    if (minBB.y < lowestModelCoordinate) { lowestModelCoordinate = minBB.y }
    grid.get().position.y = lowestModelCoordinate
    propsProcessor.process(model)
    setTimeout(() => camera.fit(), 1)
  })

  const propsManager = viewer.tools.get(OBC.IfcPropertiesManager)
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