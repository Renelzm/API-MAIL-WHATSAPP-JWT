import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";


export class CreateSeedDto {

    @IsNotEmpty({message: 'Error en datos del nombre'})
    @IsString({message: 'Error en datos del nombre'})
    nombre: string;

    entidad?: string;

    @IsEmail()
    correo: string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Transform(({ value }) => value.trim())
    password: string;

}
