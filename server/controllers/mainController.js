// get homepage

exports.homepage = (req, res) => {
    const locals = {
        title: 'Notes App',
        description: 'A simple notes app built with Node.js and Express',
    }

    res.render('index',{
        locals,
        layout: '../views/layouts/front-page'
    });

}
exports.aboutPage = (req, res) => {
    const locals = {
        title: 'Notes App',
        description: 'A simple notes app built with Node.js and Express',
    }

    res.render('about',locals);

}