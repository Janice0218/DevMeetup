import * as firebase from 'firebase'


export default{
    state: {loadedMeetups:[
        {
            imageUrl:'https://www.macleans.ca/wp-content/uploads/2018/07/JUL31_MENDELSON_HIRES-810x445.jpg', 
            id:'Canada123', 
            title:'Meet up in Canada', 
            date: new Date(),
            location: 'Toronto',
            description: 'It\'s Toronto!'
        },
        {
            imageUrl:'https://www.lufthansa.com/content/dam/lh/images/pixels_variations/c-1835470884-87780.transform/lh-dcep-transform-width-1440/img.jpg', 
            id:'USA123', 
            title:'Meet up in USA',
            date: new Date(),
            location: 'USA',
            description: 'It\'s American!'
        },
        {
            imageUrl:'http://113.108.174.131/fzlm/sygddt/201810/W020181024565062346233.jpg', 
            id:'China123', 
            title:'Meet up in China',
            date: new Date(),
            location: 'Guangzhou',
            description: 'It\'s Guangzhou!'
        },
    ]
    },
    mutations:{
        
        setLoadedMeetups (state, payload){
            state.loadedMeetups = payload
        },
        createMeetup (state, payload){
            state.loadedMeetups.push(payload)
        },
        updateMeetup (state, payload) {
            const meetup = state.loadedMeetups.find(meetup => {
              return meetup.id === payload.id
            })
            if (payload.title) {
              meetup.title = payload.title
            }
            if (payload.description) {
              meetup.description = payload.description
            }
            if (payload.date) {
              meetup.date = payload.date
            }
        }
    },
    actions:{
        
        loadMeetups ({commit}) {
            commit('setLoading', true)
            firebase.database().ref('meetups').once('value')
              .then((data) => {
                const meetups = []
                const obj = data.val()
                for (let key in obj) {
                  meetups.push({
                    id: key,
                    title: obj[key].title,
                    description: obj[key].description,
                    imageUrl: obj[key].imageUrl,
                    date: obj[key].date,
                    location: obj[key].location,
                    creatorId: obj[key].creatorId
                    })
                }
                commit('setLoadedMeetups', meetups)
                commit('setLoading', false)
            })
            .catch(
                (error) => {
                  console.log(error)
                  commit('setLoading', false)
                }
            )
        },
        createMeetup ({commit, getters}, payload) {
            const meetup = {
                title: payload.title,
                location: payload.location,
                description: payload.description,
                date: payload.date.toISOString(),
                creatorId: getters.user.id
            }
            let imageUrl
            let key
            firebase.database().ref('meetups').push(meetup)
                .then((data) => {
                    const key = data.key
                    //commit('createMeetup', {
                    //    ...meetup,
                     //   id: key
                   // })
                   return key 
                })
                .then(key =>{
                    const filename = payload.image.name
                    const ext = filename.slice(filename.lastIndexOf('.'))
                    return firebase.storage().ref('meetups/' + key + '.' + ext).put(payload.image)
                })
                .then(fileData =>{
                    imageUrl = fileData.metadata.downloadURLs[0]
                        return firebase.database().ref('meetups').child(key).update({imageUrl: imageUrl})
                })
                .then(() => {
                    commit('createMeetup', {
                      ...meetup,
                      imageUrl: imageUrl,
                      id: key
                    })
                })
                .catch((error) => {
                    console.log(error)
                })
        },
        updateMeetupData ({commit}, payload) {
            commit('setLoading', true)
            const updateObj = {}
            if (payload.title) {
              updateObj.title = payload.title
            }
            if (payload.description) {
              updateObj.description = payload.description
            }
            if (payload.date) {
              updateObj.date = payload.date
            }
            firebase.database().ref('meetups').child(payload.id).update(updateObj)
              .then(() => {
                commit('setLoading', false)
                commit('updateMeetup', payload)
            })
            .catch(error => {
                console.log(error)
                commit('setLoading', false)
            })
        },

    },
    getters:{
        loadedMeetups(state){
            return state.loadedMeetups.sort((meetupA, meetupB)=>{
                return meetupA.date > meetupB.date
            })
        },
        featuredMeetups(state, getters){
            return getters.loadedMeetups.slice(0,5)
        },
        loadedMeetup(state){
            return (meetupId) =>{
                return state.loadedMeetups.find((meetup) =>{
                    return meetup.id === meetupId
                })
            }
        }
    }
    
}