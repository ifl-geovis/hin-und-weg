import { expect } from "chai"
import * as Debug from '../../src/debug'
import Combiner from '../../src/model/Combiner'
import CombinerController from '../../src/controller/CombinerController'

Debug.on()
//TODO: Apply the humble view principle -> Controller is provided with view ...
describe('Controls the interaction between model and views (userinterface)',() => {

    let combinerController = new CombinerController()
    combinerController.setView({})

    it('Select a geodata file and tabledata file',(done) => {
         combinerController.chooseGeodata('./testdata/ot.shp')  
         combinerController.chooseTabledata('./testdata/201512_OT_4_2a_Bereinigt.csv')    

         done()          
    })
})