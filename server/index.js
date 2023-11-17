import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import { Webhook } from 'svix'
import User from './models/User.js'

/* CONFIG */
dotenv.config()
const app = express()
app.use(express.json())
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({
    policy: 'cross-origin'
}))
app.use(morgan('common'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())

/* ROUTES */
app.get('/', (_req, resp, next) => {
    resp.status(200).send(JSON.stringify({
        message: 'Hello'
    }))
    next()
})


app.post(
    '/api/webhook', 
    bodyParser.raw({ type: 'application/json' }),
    async function (req, res) {
        try {
            if (!process.env.CLERK_WEBHOOK_SECRET_KEY) 
                throw new Error('Need a WEBHOOK_SECRET in .env')
            
            // extract payload & verify webhook
            const payloadString = JSON.stringify(req.body)
            const svixHeaders = req.headers
    
            const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET_KEY)
            const evt = wh.verify(payloadString, svixHeaders)
            const { id, ...attributes } = evt.data
    
            
            // handle webhook
            const eventType = evt.type
            switch (eventType) {
                case 'user.created':
                    const user = new User({
                        clerkUserId: id,
                        firstName: attributes.first_name,
                        lastName: attributes.last_name,
                        userName: attributes.username,
                        email: attributes.email_addresses[0].email_address
                    })
                    await user.save()
                    break
                case 'user.deleted':
                    await User.deleteOne({ clerkUserId: id })
                    break
                case 'user.updated':
                    break
                default:
            }

            console.log(`User ${id} is ${eventType}`)
    
            res.status(200).json({
                success: true,
                message: 'Webhook received'
            })
        } catch (err) {
            res.status(400).json({
                success: false,
                message: err.message
            })
        }
    }
)

const PORT = process.env.PORT || 3000

mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is up & running on port ${PORT}`)
        })
    })
    .catch((error) => console.log(error.message))


