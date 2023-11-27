import * as Vue from "vue"
import * as OBC from "openbim-components"
import { defaultViewerSetup } from "../extras/default-viewer"
import { ViewerSetup } from "../index"

export const viewersManagerSymbol = Symbol()

export class ViewersManager {
  list: { [id: string]: OBC.Components } = {}
  defaultViewerSetup: ViewerSetup = defaultViewerSetup

  constructor() { 
    this.list.default = new OBC.Components()
  }

  get(id = "default") {
    if (!(id in this.list)) { this.list[id] = new OBC.Components() }
    return this.list[id]
  }

  destroy(id = "default") {
    if (!(id in this.list)) { return }
    const viewer = this.list[id]
    viewer.dispose()
    delete this.list[id]
  }
}

export const useViewersManager = () => {
  return Vue.inject(viewersManagerSymbol) as ViewersManager
}