import { useEffect, useState } from 'react'
import personService from './services/persons'

const Notification = ({notification}) => {

    if (notification.message === null) {
        return null
    } else if (notification.error) {
        return (
            <div className='errorStyle'>
                {notification.message}
            </div>
        )
    }
    return (
        <div className='notification'>
            {notification.message}
        </div>
    )
}

const Filter =({filter, handleFilterChange}) => (
    <div>filter shown with <input value={filter} onChange={handleFilterChange} /></div>
)

const PersonForm = ({addPerson, name, changeName, number, changeNumber}) => (
    <form onSubmit={addPerson}>
        <div>name: <input value={name} onChange={changeName} /></div>
        <div>number: <input value={number} onChange={changeNumber} /></div>
        <div>
            <button type="submit">add</button>
        </div>
    </form>
)

const Persons = ({persons, deletePerson}) => {
    return (
        <div>
            {persons.map(person =>
                <p key={person.name}>
                    {person.name} {person.number}
                    <button onClick={() => deletePerson(person)}>delete</button>
                </p>)}
        </div>
    )
}

const App = () => {
    const [persons, setPersons] = useState([])
    const [newName, setNewName] = useState('')
    const [newNumber, setNewNumber] = useState('')
    const [filter, setFilter] = useState('')
    const [showPersons, setShowPersons] = useState([])
    const [notification, setNotification] = useState({message: null, error: false})

    useEffect(() => {
        personService
            .getAll()
            .then(personsData => {
                const data = personsData
                setPersons(data)
                setShowPersons(data)
            })
    }, [])

    const addPerson = (event) => {
        event.preventDefault()
        let alreadyAdded = false
        persons.forEach(person => {
            if (person.name === newName) {
                alreadyAdded = true
                if (person.number !== newNumber) {
                    if (window.confirm(`${person.name} is already added to phonebook, replace the old number with a new one?`)) {
                        person.number = newNumber
                        personService
                            .update(person.id, person)
                            .then(returnedPerson => {
                                const newPersonArray = persons.map(p => p.id !== person.id ? p : returnedPerson)
                                setPersons(newPersonArray)
                                setShowPersons(newPersonArray)
                                setNotification({...notification, message:`Updated number for ${returnedPerson.name}`})
                                setTimeout(() => setNotification({...notification, message: null}), 2000)
                            })
                            .catch(error => {
                                setNotification({message: `Information of ${person.name} has already been removed from server`, error: true})
                                setTimeout(() => setNotification({...notification, message: null}), 2000)
                                const newPersonArray = persons.filter(p => p.id !== person.id)
                                setPersons(newPersonArray)
                                setShowPersons(newPersonArray)
                            })
                    }
                } else {
                    alert(newName + ' already added to phonebook')
                }
            }
        });
        if (!alreadyAdded) {
            const personObject = {
                name: newName,
                number: newNumber
            }
            personService
                .create(personObject)
                .then(personData => {
                    const person = personData
                    setPersons(persons.concat(person))
                    setShowPersons(showPersons.concat(person))
                    setNotification({...notification, message: `Added '${person.name}'`})
                    setTimeout(() => setNotification({...notification, message: null}), 2000)
                })
        }
        setNewName('')
        setNewNumber('')
    }

    const handleNameChange = (event) => {
        setNewName(event.target.value)
    }

    const handleNumberChange = (event) => {
        setNewNumber(event.target.value)
    }

    const handleFilterChange = (event) => {
        const newFilter = event.target.value.toLowerCase()
        const updateShowPersons = []
        persons.forEach(person => {
            let i = 0
            let matched = false
            const boundary = person.name.length + 1 - newFilter.length
            while (i < boundary && !matched) {
                const nameSubstr = person.name.substr(i, newFilter.length).toLowerCase()
                if (nameSubstr === newFilter) {
                    updateShowPersons.push(person)
                    matched = true
                }
                i ++
            }
        })
        setFilter(event.target.value)
        setShowPersons(updateShowPersons)
    }

    const deletePerson = (person) => {
        if (window.confirm(`Delete ${person.name}?`)) {
            personService
                .deletePerson(person.id)
                .then(() => {
                    setPersons(persons.filter(p => p.id !== person.id))
                    setShowPersons(persons.filter(p => p.id !== person.id))
                })
        }
    }

    return (
        <div>
            <h2>Phonebook</h2>
            <Notification notification={notification}/>
            <Filter filter={filter} handleFilterChange={handleFilterChange}/>
            <h3>Add a new</h3>
            <PersonForm addPerson={addPerson} name={newName} changeName={handleNameChange} number={newNumber} changeNumber={handleNumberChange}/>
            <h3>Numbers</h3>
            <Persons persons = {showPersons} deletePerson={deletePerson}/>
        </div>
    )
}

export default App