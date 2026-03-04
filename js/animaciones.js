document.addEventListener("DOMContentLoaded", function(){

const cards = document.querySelectorAll('.card');

const observer = new IntersectionObserver((entries) => {

entries.forEach(entry => {

if(entry.isIntersecting){

entry.target.classList.add('show');

}

});

}, {

threshold:0.2

});

cards.forEach(card => {

observer.observe(card);

});

});


document.addEventListener('DOMContentLoaded', () => {
  const elementos = document.querySelectorAll('.animar-lado');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  });

  elementos.forEach(el => observer.observe(el));
});