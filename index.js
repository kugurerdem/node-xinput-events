const
    {EventEmitter} = require('events'),
    {spawn, exec} = require('child_process'),

    {assign, fromEntries} = Object,

    demo = async () => {
        const xEventEmitter = await createXEventEmitter()

        xEventEmitter.on('press', console.log)

        xEventEmitter.on('release', console.log)

        xEventEmitter.on('error', console.error)

        xEventEmitter.on('close', code => console.log(`close: ${code}`))
    },

    createXEventEmitter = async () => {
        const
            xEventEmitter = new EventEmitter(),

            xKeySymsByKeyCode = await new Promise((resolve, reject) =>
                exec('xmodmap -pke', (error, stdout, stderr) => {
                    if (error)
                        reject(error)

                    const xKeySymsByKeyCodeEntries = stdout.split('\n')
                        .filter(ln => ln.includes(' = '))
                        .map(line => {
                            const
                                [lhs, keySyms] = line.split(' = '),
                                [keySym, ...restKeySyms] = keySyms.split(' '),
                                keycode = lhs.match(/(\d+)/)[1]

                            return [
                                keycode,
                                {keySym, keySyms: [keySym, ...restKeySyms]},
                            ]
                        })

                    resolve(fromEntries(xKeySymsByKeyCodeEntries))
                })
            ),

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
                const lns = data.toString().split('\n')

                if (lns[lns.length - 1] == '')
                    lns.pop()

                lns.forEach(ln => {
                    const
                        parsedLn = ln.replace(/\n/g, '').replace(/\s+/g, ' '),

                        [_, type, keycode] = parsedLn.split(' '),

                        xEvent = {keycode}

                    assign(xEvent, xKeySymsByKeyCode[keycode])
                    xEventEmitter.emit(type, xEvent)
                })
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


if (require.main === module)
    demo()
else
    module.exports = createXEventEmitter
