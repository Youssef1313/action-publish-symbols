import * as ps from '../src/publishSymbols'
import path from 'path'
import * as fs from 'fs'
import * as io from '@actions/io'
import * as tc from '@actions/tool-cache'
import { countReset } from 'console'
import * as core from '@actions/core'
import * as hlp from '../src/helpers'

test('test getTempPath', async () => {
    const symbolServiceUri = getSymbolServerUrl()
    let symbolVersion = await ps.getSymbolClientVersion(symbolServiceUri)
    expect(symbolVersion.length).toBeGreaterThan(0)
})

test('downloadSymbolClient', async () => {
    const symbolServiceUri = getSymbolServerUrl()
    const symbolPathBase = path.join(hlp.getEnvVar('RUNNER_TEMP'), 'SymbolClient')
    const symbolClientVersion = '1.0.0'
    let symbolPath = path.join(symbolPathBase, symbolClientVersion)
    let result = await ps.downloadSymbolClient(symbolServiceUri, symbolPath)
    expect(result.length).toBeGreaterThan(0)
})

test('unzipSymbol', async () => {
    const symbolServiceUri = getSymbolServerUrl()
    const symbolPathBase = path.join(hlp.getEnvVar('RUNNER_TEMP'), 'SymbolClient')
    const symbolClientVersion = '1.0.0'
    let symbolPath = path.join(symbolPathBase, symbolClientVersion)
    const pathToZip = await ps.downloadSymbolClient(symbolServiceUri, symbolPath)
    const unzipSymbolDestination = path.join(symbolPath, 'symbol.app.buildtask')
    await ps.unzipSymbolClient(pathToZip, unzipSymbolDestination)
})

test('downloadAndCache', async () => {
    const symbolClientVersion = '1.0.0'
    const symbolServiceUri = getSymbolServerUrl()
    let toolPath = ps.find("SymbolClient", symbolClientVersion)
    const symbolPathBase = path.join(hlp.getEnvVar('RUNNER_TEMP'), 'SymbolClient')
    let symbolPath = path.join(symbolPathBase, symbolClientVersion)
    expect(toolPath).toContain('')
    const symbolZipPath = await ps.downloadSymbolClient(symbolServiceUri, symbolPath)
    const unzipSymbolDestination = path.join(symbolPath, 'symbol.app.buildtask')
    await ps.unzipSymbolClient(symbolZipPath, unzipSymbolDestination)
    let cacheResult = await tc.cacheDir(unzipSymbolDestination, "SymbolClient", symbolClientVersion)
    toolPath = ps.find("SymbolClient", symbolClientVersion)
    expect(toolPath).toHaveLength
})

test('updateSymbolClient', async () => {
    const symbolServiceUri = getSymbolServerUrl()
    let toolPath = await ps.updateSymbolClient(symbolServiceUri)
    expect(toolPath).toHaveLength
    const allVersions = ps.findAllVersions('SymbolClient')
    for(let version in allVersions) {
        console.debug(`Version: ${version}`)
    }
})

test('getSymbolServiceUri', async () => {
    const symbolServiceUri = getSymbolServerUrl()
    const personalAccessToken = core.getInput('personalAccessToken') as string
    const artifactUrl = await ps.getSymbolServiceUri(symbolServiceUri, personalAccessToken)
    expect(artifactUrl.length).toBeGreaterThan(0)
})

function getSymbolServerUrl(): string {
    const accountName = core.getInput('accountName') as string
    const symbolServiceUri = `${core.getInput('symbolServiceUrl')}/${accountName}` as string
    return symbolServiceUri
}