export class GithubFavs {
    constructor(root) {
        this.root = document.querySelector(root)
        this.tbody = this.root.querySelector("table tbody")
        
        this.load()        
        this.updateTable()
        this.addBtn()
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem("@github-fav:")) || []
    }

    save() {
        localStorage.setItem("@github-fav:", JSON.stringify(this.entries))
    }

    removeAllRows() {
        this.tbody.querySelectorAll("tr").forEach((tr) => {tr.remove()})
    }

    createRow() {
        const tr = document.createElement("tr")
        tr.innerHTML = `
        <tr>
            <td class="user-info">
                <img src="https://github.com/AlanRehfeldt.png" alt="">
                <div>
                    <p>Alan Rehfeldt</p>
                    <a href="https://github.com/AlanRehfeldt" target="_blank">/AlanRehfeldt</a>
                </div>
            </td>
            <td class="repositories">22</td>
            <td class="followers">3</td>
            <td><button class="remove">Remover</button></td>
        </tr>
        `
        return tr
    }

    updateTable() {
        this.removeAllRows()

        this.entries.forEach(user => {
            const row = this.createRow()

            row.querySelector(".user-info img").src = `https://github.com/${user.login}.png`
            row.querySelector(".user-info img").alt = `Imagem de ${user.login}`
            row.querySelector(".user-info div p").textContent = `${user.name}`
            row.querySelector(".user-info div a").href = `https://github.com/${user.login}`
            row.querySelector(".user-info div a").textContent = `/${user.login}`
            row.querySelector(".repositories").textContent = `${user.public_repos}`
            row.querySelector(".followers").textContent = `${user.followers}`

            row.querySelector(".remove").onclick = () => {
                const isOk = confirm("Tem certeza que deseja deletar esse usuário?")
                if(isOk) {
                    this.delete(user)
                }
            }

            this.tbody.append(row)
        })
    }

    delete(user) {
        const filteredEntries = this.entries
            .filter(entry => entry.login !== user.login)

        this.entries = filteredEntries
        console.log(filteredEntries)
        this.updateTable()
        this.save()
    }

    addBtn() {
        const addBtn = this.root.querySelector(".search-btn")
        addBtn.onclick = () => {
            const value = this.root.querySelector(".search-input").value
            this.add(value)
        }
    }

    async search(username) {
        const url = `https://api.github.com/users/${username}`

        return fetch(url)
                .then(data => data.json())
                .then(({login, name, public_repos, followers}) => ({
                    login, name, public_repos, followers
                }))
    }

    async add(username) {
        try {
            const userExists = this.entries.find(entry => entry.login === username)
            if(userExists) {
                throw new Error("Usuário já cadastrado")
            }

            const user = await this.search(username)
            if(user.login === undefined) {
                throw new Error("Usuário não encontrado")
            }

            this.entries = [user, ...this.entries]
            this.updateTable()
            this.save()
        } catch(e) {
            alert(e.message)
        }
    }
}