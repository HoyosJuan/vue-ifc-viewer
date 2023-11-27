import * as OBC from "openbim-components"
import IFCViewer from "./components/IFCViewer.vue"
import { App, Plugin } from "vue"
import { ViewersManager, viewersManagerSymbol } from "./composables/useViewerManager"

export type ViewerSetup = (viewer: OBC.Components, container: HTMLDivElement, name: string) => Promise<void>

export interface IfcPluginConfig {
  defaultViewerSetup: ViewerSetup
}

export const ifcViewer: Plugin = {
  install: (app: App, options?: IfcPluginConfig) => {
    const viewersManager = new ViewersManager()
    app.provide(viewersManagerSymbol, viewersManager)
    if (!options) { return }
    viewersManager.defaultViewerSetup = options.defaultViewerSetup
  }
}

export default IFCViewer
export * from "./composables"