import { GithubUser } from "./GithubUser.js"

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.load()
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
    }
    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
    }
    async add(username) {
        try {
            const inputValue = this.root.querySelector('.searchGithub input')
            const userExists = this.entries.find(entry => entry.login === username)

            if(userExists) {
                throw new Error ("Usuário já cadastrado")
            }

            const user = await GithubUser.search(username)

            if(user.login === undefined) {
                throw new Error("Usuário não encontrado!")
            } 

            this.entries = [user, ...this.entries]
            this.update()
            inputValue.value = ""
            this.save()

        } catch (error) {
            alert(error.message)
        }
    }

    delete(user) {  
        const filteredEntries = this.entries.filter(entry => 
            entry.login !== user.login)

        this.entries = filteredEntries
        this.update()
        this.save()
    }
}

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)

        this.tbody = this.root.querySelector('table tbody')
    
        this.update()
        this.onadd()
    }
    onadd() {
        const addButton = this.root.querySelector('.searchGithub button')
        addButton.onclick = () => {
            const { value } = this.root.querySelector('.searchGithub input')

            this.add(value)
        }
    }

    update() {
        this.removeAllTr()
        if(this.entries.length == 0) {
            this.tbody.append(this.creatEmptyRow())
        }
        
        this.entries.forEach( user => { 
            const row = this.creatRow()
            
            row.querySelector(".user img").src = `https://github.com/${user.login}.png`
            row.querySelector(".user img").alt = `Imagem de ${user.name}}`
            row.querySelector(".user a").href = `https://github.com/${user.login}`
            row.querySelector(".user p").textContent = user.name
            row.querySelector(".user span").textContent = user.login
            row.querySelector(".repositories").textContent = user.public_repos
            row.querySelector(".followers").textContent = user.followers

            row.querySelector(".remove").onclick = () => {
                const isOk = confirm("Tem certeza que deseja excluir ?")
                if (isOk) {
                    this.delete(user)
                }
            }

            this.tbody.append(row)
        })
    }

    creatRow() {
        const tr = document.createElement('tr')

        tr.innerHTML = `
            <tr>
                <td class="user">
                    <img src="" alt="">
                    <a href="" target="_blank">
                    <p></p>
                    <span></span>
                    </a>
                </td>
                
                <td class="repositories"></td>
                <td class="followers"></td>

                <td>
                    <button class="remove">Remover</button>
                </td>
            </tr>
        `

        return tr
    }

    creatEmptyRow() {
        const tr = document.createElement('tr')
        tr.classList.add('zeroFavorites')

        tr.innerHTML = `
            <tr class="zeroFavorites">
                <td>
                    <img src="./img/star-zero.svg" alt="Logo">
                    <p>Nenhum favorito ainda</p>
                </td>
            </tr>
        `

        return tr
    }

    removeAllTr() {
        this.tbody.querySelectorAll("tbody tr")
        .forEach((tr) => {
            tr.remove()
        })
    }
}
