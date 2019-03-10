/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
chai.use(require('chai-bytes'))
const expect = chai.expect

const spawnDaemons = require('../utils/spawnDaemons')

describe('pubsub', () => {
    let daemons

    // Start daemons
    before(async function () {
        this.timeout(20 * 1000)

        daemons = await spawnDaemons(2, ['js', 'go'])

        // connect them
        const identify0 = await daemons[0].client.identify()
        await daemons[1].client.connect(identify0.peerId, identify0.addrs)
    })

    // Stop daemons
    after(async function () {
        await Promise.all(
            daemons.map((daemon) => daemon.stop())
        )
    })

    it("js publish to go subscriber", async function () {
        this.timeout(10 * 1000)

        const topic = "test-topic"
        const data = Buffer.from('test-data')

        const subscribeIterator = daemons[1].client.pubsub.subscribe(topic)
        daemons[0].client.pubsub.publish(topic, data)
        for await (const message of subscribeIterator) {
            expect(message).to.exist()
            expect(message.data).to.exist()
            expect(message.data).to.equalBytes(data)
        }
    })
})