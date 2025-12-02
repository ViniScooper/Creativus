import './style.css'
import Trash from '../../assets/vite.svg'

function home() {

  const users = [{

    id: '234sdasd',
    name: 'rodolfo',
    age: 29,
    email: 'rod@gmail.com'

  }, {

    id: '234sdasd2123',
    name: 'gabriele',
    age: 29,
    email: 'gab@gmail.com'


  }
  ]

  return (

    <div className='container'>
      <form>
        <h1>cadastro de users</h1>
        <input placeholder="Nome" name='nome' type="text" />
        <input placeholder="idade" name='idade' type="number" />
        <input placeholder="idade" name='email' type="email" />
        <button type='button'>cadastrar</button>

      </form>
      {/* esse map vai mapear o array users e vai pegar cada usuario(user) */}

      {users.map(user => (

        <div key={user.id} className='card'>

           <div>
            <p>nome :<span>{user.name} </span></p>
            <p>idade :<span>{user.age}</span></p>
            <p>email : <span>{user.email}</span></p>
           </div>

        

          <button>
            <img src={Trash} alt="Trash Icon" className="trash-icon" />
          </button>
        </div>



      ))}
 
      



    </div>


  )
}

export default home


//esqueleto de um componente react