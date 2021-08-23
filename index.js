
const io = require("socket.io")({
    cors: {
        origin: "*",
    },
});

const ior = require('ioredis')
const REDIS_ADDRESS = '127.0.0.1:6379'

// testing call
// redis.ping().then(console.log).catch(console.error)


// redis.setex("test", 600,"this is test message").then(console.log).catch(console.log)

io.on("connection", function(socket){
    const subscriber = new ior(REDIS_ADDRESS)
    const publisher = new ior(REDIS_ADDRESS)
    
    socket.join("messages");

    subscriber.subscribe(`messages`)

    subscriber.on("message", function(channel, message){
        console.log(typeof channel)
        console.log(channel, message)
        io.to(channel).emit('new-message', message)
    })
    
    socket.on("send", function(data){
        // send to redis
        publisher.publish(`messages`, data)
    });

    socket.on("disconnect", function(){
        subscriber.unsubscribe()
        subscriber.quit()
        publisher.quit()
    })

})

io.listen(process.env.PORT)