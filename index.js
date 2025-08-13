const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const {nanoid} = require('nanoid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

//connecting to mangoDB
mongoose.connect(process.env.DATABASE_URL)
    .then(()=> console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

const urlSchema = new mongoose.Schema({
    originalUrl: { type: String, required: true },
    shortUrl: { type: String, required: true, unique: true }
})

const Url = mongoose.model('Url', urlSchema)

app.post('/api/short', async(req,res)=>{
    try {
        const {originalUrl} = req.body;
        if(!originalUrl) {
            return res.status(400).json({message: 'Original URL is required'});
        }
        const shortUrl = nanoid(8);
        const url = new Url({originalUrl, shortUrl})
        await url.save();
        return res.status(200).json({message: 'URL Generated', url:url})
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Internal Server Error'})   
    }
})

    app.get('/:shortUrl', async(req,res)=>{
        try {
            const {shortUrl} =req.params;
            const url = await Url.findOne({shortUrl});
            if(!url) {
                return res.status(404).json({message: 'URL not found'});
            }if(url){
                // url.clicks++;
                // await url.save();
                return res.redirect(url.originalUrl)
            }else{
                return res.status(404).json({error: 'URL nor found'})
            }
            
        } catch (error) {
             console.log(error);
        res.status(500).json({message: 'Internal Server Error'}) 
        }
    })
    
    app.listen(3000, ()=> console.log('Server is running on port 3000'));
    