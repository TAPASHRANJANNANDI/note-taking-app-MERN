import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'
import noteRoutes from './routes/note.route.js'

const app = express()
dotenv.config()
const port = process.env.PORT || 4002

// Database Connection Code
try {
   mongoose.connect(process.env.MONGO_URL)
   console.log("conntected to MongoDB")
} catch (error) {
    console.log("Error connecting to MongoDB", error)
}

// Routing Middleware
app.use(express.json())
app.use(cors())
app.use("/api/v1/noteapp", noteRoutes)

app.listen(port, () => {
  console.log(`Server is running on ${port}`)
})
// mongodb+srv://tapashbariflo_db_user:yuYD21YBP1bziUSx@cluster1.ynrsg2p.mongodb.net/notesDb?retryWrites=true&w=majority&appName=Cluster1
