/**
 * Created by mathiaspettersson on 04/07/17.
 */
if (!window.gameClient && window.location.href.indexOf('FAKECLIENT') > -1) {
    console.log('creating fake gameClient')

    window.fakeGameClient = function () {}

    window.gameClient = function () {
        window.fakeGameClient()
    }
}