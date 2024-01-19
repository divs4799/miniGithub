import { Octokit, App } from "https://esm.sh/octokit";

const octokit = new Octokit({ auth: `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` });
const {
    data: { login },
  } = await octokit.rest.users.getAuthenticated();
  console.log("Hello, %s", login);
  var user="";
  var currentPage=1;
  var totalPages=0;
  var numEntries=10;
  var totalRepo;

  document.querySelector("#searchBtn").addEventListener("click",(event)=>{
    event.preventDefault();
    user = document.getElementById("userName").value;
    if(!(user =="")){
        getOwnerDetails(user);

    }else{
        console.log("Empty username");
    }
  })
  document.querySelector("#entry-per-page").addEventListener("change",(event)=>{
    numEntries = Number(event.target.value);
    getCurrentPageRepos(user,currentPage);
    insertPagination(totalRepo);
  })
  async function getOwnerDetails(user){

    try{
      
        let owner = await octokit.request('GET /users/{username}', {
            username: user,
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
          });
          if(owner.status==200){
            
            totalRepo = owner.data.public_repos;
            
            if(owner.data.twitter_username!=null){

            document.querySelector(".link-twitter").href =`https://twitter.com/$owner.data.html_url`;
        }else{
                document.querySelector(".link-twitter").style.display = "none";

            }
            document.querySelectorAll(".toggle").forEach((element)=>{
              element.style.display="block";
            })
            document.querySelector(".owner-image").src = owner.data.avatar_url;
            document.querySelector(".owner-follower").innerHTML =owner.data.followers;
            document.querySelector(".link-github").href =owner.data.html_url;
            document.querySelector(".owner-name").innerHTML =owner.data.name;
            document.querySelector(".owner-username").innerHTML =owner.data.login;
            document.querySelector(".owner-location").innerHTML =owner.data.location;
            document.querySelector(".owner-bio").innerHTML =owner.data.bio;
            getCurrentPageRepos(user,currentPage);
            insertPagination(totalRepo);
          }else{
    
          }
    }catch(error){
        document.getElementById("")
    }
  }

  async function getCurrentPageRepos(user,currentPage){
    
    displayLoader();
    try{
      
    
    document.querySelector(".repo-List").innerHTML="";
    let result = await octokit.request('GET /users/{username}/repos', {
      username: user,
      page: currentPage,
      per_page: numEntries,
      headers: {
          'X-GitHub-Api-Version': '2022-11-28'
      }
  });
  var repoList = result.data
  console.log(repoList);
  repoList.forEach(async repo => {
    var languages = await getRepoLang(user,repo.name);
    var langList = Object.keys(languages);
    createCard(repo.name,repo.description,langList);
  });
}catch(error){console.log(error)} finally{ hideLoader()}
  
  }

  async function getRepoLang(user,repo){
    let response =await octokit.request('GET /repos/{owner}/{repo}/languages', {
      owner: user,
      repo: repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    return response.data;
  }

  function createCard(repoName,repoDesc,langList){
    var innerLi = ` <div class="card repo-card">
    <div class="card-header">
      ${repoName}
    </div>
    <div class="card-body card-content">
      <p  class="card-text card-p">${repoDesc}</p>`
  langList.forEach(lang=>{
    innerLi+= `<button type="button" class="btn btn-sm btn-primary m-1 langBtn"   disabled>${lang}</button>`;
  })
  innerLi+=`</div></div>`
  
  var li = document.createElement("li");
  li.innerHTML =innerLi;
  document.querySelector(".repo-List").appendChild(li); 
  }



  function insertPagination(totalRepo) {
    
    totalPages = Math.ceil(totalRepo / numEntries);

    document.querySelector(".pagination").innerHTML=`<li class="page-item" id="previous" data-bs-theme="dark"><a class="page-link" href="#">Previous</a></li>
    
    <li class="page-item" id="next" ><a class="page-link" href="#">Next</a></li>`;

    for (var j = 0; j < totalPages; j++) {

        var li = document.createElement("li");
        li.classList.add("page-item");
        var a = document.createElement("a");
        a.classList.add("page-link");
        a.innerHTML = j + 1;  // Set the text content of the anchor element
        if(j==0){
          a.classList.add("active");
        }
        // Use a function reference, not the result of the function
        a.addEventListener("click", handlePageChange);
        
        li.appendChild(a);
        document.querySelector("#next").insertAdjacentElement("beforebegin", li);
    }

    document.querySelector("#next").addEventListener("click", handleNext);
    document.querySelector("#previous").addEventListener("click", handlePrevious);
}
  

  function handlePageChange(event){
    
    var changeto= Number(event.target.innerHTML);
    
    if(changeto!=currentPage){
      currentPage= changeto;
      makeActive();
      getCurrentPageRepos(user,currentPage);
    }

  }

  function handleNext(){
    
    
    if(currentPage<totalPages){
      currentPage++;
      makeActive();
      getCurrentPageRepos(user,currentPage);
    }
  }
function makeActive(){
  document.querySelector(".active").classList.remove("active");
  document.querySelectorAll(".page-link").forEach((page)=>{
    if(Number(page.innerHTML)==currentPage){
      page.classList.add("active");
    }
  })
}
  function handlePrevious(){
    
    if(currentPage>1){
      currentPage--;
      makeActive();
      getCurrentPageRepos(user,currentPage);
    }
  }
  
  function displayLoader(){
    document.querySelector(".loader").classList.remove("hide");
    document.querySelector(".loader").classList.add("show");
  }
  function hideLoader(){
    document.querySelector(".loader").classList.remove("show");
    document.querySelector(".loader").classList.add("hide");
  }
  

  


 