class Oferta{
    constructor(id, empleador, nombre, sector, habilidades){
        this.id = id;
        this.empleador = empleador;
        this.nombre = nombre;
        this.sector = sector;
        this.habilidades = habilidades;
    }
    toJSON(){
        return("{"+
        "\"id\":"+this.id + ","+
        "\"empleador\":"+this.empleador + ","+
        "\"nombre\":\""+this.nombre + "\","+
        "\"sector\":\""+this.sector + "\","+
        "\"habilidades\":"+JSON.stringify(this.habilidades)+
        "}");
    }
    static fromJSON(json){
        var obj  = JSON.parse(json);
        return new Oferta(obj.id,obj.empleador,obj.nombre,obj.sector,obj.habilidades);
    }
    toString(){
        return(
            "id: " + this.id +
            "empleador: " + this.empleador +
            "nombre: " + this.nombre+
            "\nsector: " + this.sector+
            "\nhabilidades: " + this.habilidades
        );
    }
}
module.exports = Oferta