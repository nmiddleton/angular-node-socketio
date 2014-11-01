'use strict';

var kafkaroot= '../node_modules/kafka-node',
    Consumer = require(kafkaroot + '/lib/consumer'),
    Producer = require(kafkaroot + '/lib/producer'),
    Client =  require( kafkaroot + '/lib/client'),
    Offset =  require( kafkaroot + '/lib/offset');
var client, consumer,
    options = { autoCommit: false, fromBeginning: false, fetchMaxWaitMs: 1000, fetchMaxBytes: 1024 * 1024 };

var topics = [
    { topic: 'hannu-raw' }
];

var connectionString = 'kafka01:2181/',
    clientId = 'kafka-node-group';

// Create consumer
client = new Client(connectionString, clientId);
consumer = new Consumer(client, topics, options);
var offset = new Offset(client);


console.log('CONSUMING..', topics);

consumer.on('error', function (err) {
    console.error('error', err);
});
consumer.on('offsetOutOfRange', function (topic) {
    topic.maxNum = 2;
    offset.fetch([topic], function (err, offsets) {
        var min = Math.min.apply(null, offsets[topic.topic][topic.partition]);
        consumer.setOffset(topic.topic, topic.partition, min);
    });
});
consumer.on('message', function (message) {

    console.log('CONSUMER O: ' + this.id + JSON.stringify(message));
});