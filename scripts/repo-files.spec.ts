import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { uniqueRepoFiles } from './repo-files.ts'

const roots: string[] = []

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { force: true, recursive: true })
})

describe('uniqueRepoFiles', () => {
  it('matches a recursive filename pattern without descending through a file symlink', () => {
    const root = mkdtempSync(join(tmpdir(), 'dsh-repo-files-'))
    roots.push(root)
    mkdirSync(join(root, 'source'), { recursive: true })
    mkdirSync(join(root, 'alias'), { recursive: true })
    writeFileSync(join(root, 'source', 'target.md'), 'source')
    symlinkSync('../source/target.md', join(root, 'alias', 'target.md'))

    const files = uniqueRepoFiles(root, ['**/target.md'])

    expect(files).toHaveLength(1)
    expect(files[0]?.real).toBe(realpathSync(join(root, 'source', 'target.md')))
  })
})
