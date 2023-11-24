const
    {EventEmitter} = require('events'),
    {spawn, exec} = require('child_process'),

    createXEventEmitter = async () => {
        const
            xEventEmitter = new EventEmitter(),

            xinputKeyboardDeviceIds = await new Promise((resolve, reject) =>
                exec('xinput --list', (error, stdout, stderr) => {
                    if (error)
                        reject(error)

                    const xinputKeyboardDeviceIds = stdout.split('\n')
                        .filter(ln =>
                            ln.includes('keyboard')
                            && !ln.includes('Virtual')
                        )
                        .map(line => line.match(/id=(\d+)/)[1])

                    resolve(xinputKeyboardDeviceIds)
                })
            ),

            xinputKeyboardListenProcesses =
                xinputKeyboardDeviceIds.map(
                    id => spawn('xinput', ['test', id])
                )

        xinputKeyboardListenProcesses.forEach(ps => {
            ps.stdout.on('data', data => {
                const
                    ln =
                        data.toString().replace(/\n/g, '').replace(/\s+/g, '')

                    [_, type, keycode] = ln.replace(/\s+/g, ' ').split(' ')

                xEventEmitter.emit(type, keycode)
            })

            ps.stderr.on('data', data => {
                xEventEmitter.emit(
                    'error',
                    `child process stderr entry: ${data.toString()}`,
                )
            })

            ps.on('close', code => {
                xEventEmitter.emit('error', `child process exited with code ${code}`)

                xEventEmitter.removeAllListeners()
                xEventEmitter.emit('close', code)
            })
        })

        return xEventEmitter
    }


module.exports = createXEventEmitter
