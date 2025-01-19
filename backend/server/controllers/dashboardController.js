const mongoose = require("mongoose");
const Note = require("../models/notes");
const e = require("express"); // Add this line to import the Note model

exports.dashboard = async (req, res) => {
    let perPage = 5;
    let page = req.query.page || 1;

    const locals = {
        title: "Dashboard",
        description: "Free NodeJS Notes App.",
    };

    try {


        const notes = await Note.aggregate([
            { $sort: { updatedAt: -1 } },
            { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
            {
                $project: {
                    title: { $substr: ["$title", 0, 30] },
                    body: { $substr: ["$body", 0, 100] },
                },
            },
        ])
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();


        const count = await Note.countDocuments({ user: req.user.id });

        res.render('dashboard/index', {
            userName: req.user.firstName,
            locals,
            notes,
            layout: "../views/layouts/dashboard",
            current: page,
            pages: Math.ceil(count / perPage)
        });
    } catch (error) {
        console.error("Error in dashboard route:", error);
        res.status(500).send("An error occurred while fetching notes");
    }
};


exports.dashboardViewNote = async (req, res) => {
    const note = await Note.findById(req.params.id)
        .where({ user: req.user.id }).lean();
    if(note)
    {
        res.render('dashboard/view-notes', {
            noteID  : req.params.id,
            note,
            layout: "../views/layouts/dashboard",
        });
    }else{
        res.status(404).send("Something went wrong");
    }
}

exports.dashboardUpdateNote = async (req, res) => {
        try {
            await Note.findOneAndUpdate(
                { _id: req.params.id },
                {
                    title: req.body.title,
                    body: req.body.body,
                    updatedAt: Date.now()
                }).where({user: req.user.id})
            res.redirect('/dashboard');
        }catch (err){
            res.status(500).send(err)}
}

exports.dashboardDeleteNote = async (req, res) => {
    try {
        await Note.deleteOne({_id: req.params.id}).where({user: req.user.id});
        res.redirect('/dashboard');
    } catch (err) {
        res.status(500).send(err)
    }
}

exports.dashboardAddNote = (req, res) => {
    res.render('dashboard/add-notes', {
        layout: "../views/layouts/dashboard",
    });
}
exports.dashboardCreateNote = async (req, res) => {
    try {
        req.body.user = req.user.id;
        await Note.create({
            title: req.body.title,
            body: req.body.body,
            user: req.user.id
        });
        res.redirect('/dashboard');
    } catch (err) {
        res.status(500).send(err)
    }
}

exports.dashboardSearch = async (req, res) => {
    try {
        res.render("dashboard/search", {
            searchResults: "",
            layout: "../views/layouts/dashboard",
        });
    } catch (error) {
        res.status(500).send(error)
    }
}

exports.dashboardSearchSubmit = async (req, res) => {
    try{
        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChars = searchTerm.replace(/[^a-zA-Z0-9]/g, '');
        const searchResults = await Note.find({
            $or: [
                { title: { $regex: searchNoSpecialChars, $options: "i" } },
                { body: { $regex: searchNoSpecialChars, $options: "i" } },
            ],
        }).where({ user: req.user.id });
        res.render("dashboard/search", {
            searchResults,
            layout: "../views/layouts/dashboard",
        });
    }catch (err) {
        res.status(500).send(err)
    }
}
