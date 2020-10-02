document.addEventListener("DOMContentLoaded", function() {

  const navBlock = document.querySelector('.nav-block')
  const navLink = navBlock.querySelectorAll('.nav-block__link')
  const progress = navBlock.querySelector('.nav-block__progress')

  navLink.forEach(item => {
    item.addEventListener('click', event => {
      event.preventDefault()
      navLink.forEach( i => {
        i.parentElement.classList.remove('active')
      })
      item.parentElement.classList.add('active')
      questionsProgress()
    })
  })

  function questionsProgress() {
    const activeEl = document.querySelector('.nav-block__item.active')
    const ofset = 9
    const DOMRectNavBlok = navBlock.getBoundingClientRect()
    const DOMRectAvtiveEl = activeEl.getBoundingClientRect()
    const widthProgress = DOMRectAvtiveEl.x - DOMRectNavBlok.x + DOMRectAvtiveEl.width - ofset
    const widthPercentProgress = widthProgress * 100 / DOMRectNavBlok.width

    progress.style.width = `${widthPercentProgress}%`
  }

  questionsProgress()

});
