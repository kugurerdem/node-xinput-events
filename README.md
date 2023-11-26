# Xinput Event Emitter for Node

This library provides an event emitter based for the linux process ``xinput``.
It basically allows Linux users with X to be able to track system keyboard
events.

The module uses ``xinput`` and ``xmodmap`` under the hood. ``xinput`` is used
for getting the keyboard events while ``xmodmap`` is used for matching defined
KeySymbols with the KeyCodes obtained from ``xinput`` events.

## Disclaimer

This library was created for the sole purpose of learning and experimentation.
It is not intended for production use, and there are no guarantees of its
reliability or suitability for any particular purpose.

## Demo

Here is a quick demo on how to use this module:

```javascript
    demo = async () => {
        const
            xEventEmitter = await createXEventEmitter()

        xEventEmitter.on('press',
            (e) => console.log(`press: ${e.keycode} ${e.keySym}`))

        xEventEmitter.on('release',
            (e) => console.log(`release: ${e.keycode} ${e.keySym}`))

        xEventEmitter.on('error', console.error)

        xEventEmitter.on('close', code => console.log(`close: ${code}`))
    }
```

## Events

The events emitted to ``press`` and ``release`` has the properties ``keycode``,
``keySym`` and ``keySyms``

## NOTES

* Why ``xinput`` instead of ``xev``?

The main difference between ``xev`` and ``xinput`` is that ``xinput`` allows
you to listen keyboard events that are coming through certain devices while
``xev`` allows you to listen events for a specific window selected.

* Why not use ``x11`` library directly?

I had certain problems regarding building the ``x11`` nodejs library on my
Linux Machine. Usage of ``x11`` library will probably be just as fine, but
since it is a lower-level library, some might still prefer using this library
instead of dealing with the details of X protocol.
