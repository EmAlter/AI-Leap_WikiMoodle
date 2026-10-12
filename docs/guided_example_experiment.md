Questa sezione presenta un esempio guidato per la creazione di una sperimentazione nel sistema su Moodle.

## Creare una categoria di corso
![type:video](assets/videos/experiment_category.mp4)

Nel video sopra viene mostrato come creare una [categoria di corso](experiment.md#creare-una-nuova-categoria-di-corso) che servirà come contenitore per le sperimentazioni.

## Creare una sperimentazione
![type:video](assets/videos/experiment.mp4)

Una volta creata la categoria di corso, nel video sopra viene mostrato come creare una nuova [sperimentazione](experiment.md#creare-una-nuova-sperimentazione) definendone gli attributi principali.

## Inserire gli utenti in una sperimentazione

!!! warning "ATTENZIONE"
    Da qui in poi bisogna avere visto l'esempio guidato per la creazione degli utenti ([vedi sezione](guided_example_role_class_user.md)) in quanto gli utenti creati in quella sezione saranno inseriti nella sperimentazione.

Nel video sottostante viene mostrato come inserire gli utenti, in una sperimentazione, che appartengono a una classe specifica
![type:video](assets/videos/experiment_users.mp4)

Una volta inseriti gli utenti, è possibili suddividerli ulteriormente in gruppi locali della sperimentazione per meglio gestire gli accessi ai test
![type:video](assets/videos/local_experiment_class.mp4)

Nel video la creazione dei gruppi locali avviene automaticamente e in modo casuale, decidendo solo: il numero di gruppi da creare e quale classe globale suddividere.

## Creare un corso all'interno di una sperimentazione
La sperimentazione creata nel passaggio precedente è ora pronta a ospitare corsi.

Di default una sperimentazione vuota in Moodle genera già le sue sezioni che sono state definite essere i corsi del progetto concettuale (vedi [corso](course.md)), perciò è possibile rinominare le sezioni già presenti...
![type:video](assets/videos/course_part1.mp4)

...oppure creare nuove sezioni come mostrato di seguito
![type:video](assets/videos/course_part2.mp4)

## Crea un test all'interno di un corso
Una volta definito un corso si dovranno generare al suo interno i test che saranno somministrati ai testati:
![type:video](assets/videos/test.mp4)

All'inizio non è importante definire il contenuto del test o le sue condizioni di accesso, questi due aspetti saranno definiti in seguito.

## Inserire attività in un test

!!! warning "ATTENZIONE"
    Da qui in poi bisogna avere visto l'esempio guidato per la creazione delle attività ([vedi sezione](guided_example_activity.md)) in quanto le attività create in quella sezione saranno utilizzate per definire il contenuto dei test.

Una volta che le attività sono state definite nella raccolta attività, inserirle in un test è molto semplice, come mostrato nel video sottostante:
![type:video](assets/videos/test_activity.mp4)


## Definire le condizioni di accesso a corsi e test
Non tutti i corsi e i test saranno accessibili a tutti gli utenti, per esempio una classe di utenti potrebbe avere accesso a un corso e non a un altro, oppure un test potrebbe essere accessibile solo a una parte degli utenti di una classe, perciò è necessario definire le condizioni di accesso a corsi e test, come mostrato nei video sottostanti:

* Accesso a un corso
![type:video](assets/videos/course_access.mp4)

* Accesso a un test
![type:video](assets/videos/test_access.mp4)

In questo modo ogni utente sarà suddiviso in gruppi e avrà accesso solo ai corsi e ai test a lui destinati, come definito nella sperimentazione.