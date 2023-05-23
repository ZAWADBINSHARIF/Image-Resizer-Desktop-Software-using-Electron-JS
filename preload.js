const {contextBridge, ipcRenderer, } = require('electron')

const os = require('os')
const path = require('path')
const toastify = require('toastify-js')

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) =>
        ipcRenderer.on(channel, (event, ...arg) => func(...arg))
})

contextBridge.exposeInMainWorld('toastify', {
    toast: (options)=> toastify(options).showToast()
})

contextBridge.exposeInMainWorld('path', {
    join: (...arg)=> path.join(...arg)
})

contextBridge.exposeInMainWorld('os', {
    homedir: ()=> os.homedir()
})