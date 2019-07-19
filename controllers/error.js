exports.get404 = (request, response, next) => {
    response.status(404).render('404', {
      pageTitle: 'Page not Found',
      path: '/404'
    });
};

exports.get500= (request, response, next) => {
  response.status(500).render('500', {
    pageTitle: 'Page not Found',
    path: '/500'
  });
};
